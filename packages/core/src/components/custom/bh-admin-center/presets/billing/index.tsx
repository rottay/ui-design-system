'use client';

/**
 * BhAdminCenter - Billing Preset
 * Cost-focused admin view with enhanced billing analytics,
 * token usage trends, cost allocation, and spend forecasting.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createCardHoverStyles,
  createDividerStyle,
  createEmptyStateStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createFilterPillStyle,
  createHoverStyle,
  createIconContainerStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createPersonalityAccentBar,
  createPersonalitySectionHeaderStyle,
  createProgressBarStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  getCardPadding,
  getPersonalityBadgeRadius,
  getPersonalityTypography,

  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { DesignTokens } from '../../../../../types';
import type { BhAdminCenterProps, DateRangeValue } from '../../core';
import {
  getProviderStatusColors,
  getSeverityColors,
  getComplianceColors,
  formatTokenBalance,
  formatCurrency,
  formatPercentage,
  DATE_RANGE_OPTIONS,
} from '../../core';
import {
  AlertTriangle,
  ArrowDown,
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Flame,
  Gauge,
  Globe,
  Layers,
  Lock,
  PieChart,
  RefreshCw,
  Settings,
  Shield,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';

export const BillingBhAdminCenter = createPreset<BhAdminCenterProps>({
  name: 'BhAdminCenter.Billing',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhAdminCenterProps>) => {
    const { Box, Text } = primitives;
    const severityColors = getSeverityColors(tokens);
    const complianceColors = getComplianceColors(tokens);

    const {
      systemHealth,
      providers: rawProviders = [],
      billing,
      kpis: rawKpis = [],
      users,
      events: rawEvents = [],
      costBreakdown: rawCostBreakdown = [],
      compliance,
      quickActions: rawQuickActions = [],
      onProviderClick,
      onEventClick,
      onQuickAction,
      onDateRangeChange,
      onExportReport,
      onRefresh,
      title = 'Billing & Cost Center',
      className,
      style,
    } = props;

    const providers = Array.isArray(rawProviders) ? rawProviders : [];
    const kpis = Array.isArray(rawKpis) ? rawKpis : [];
    const events = Array.isArray(rawEvents) ? rawEvents : [];
    const costBreakdown = Array.isArray(rawCostBreakdown) ? rawCostBreakdown : [];
    const quickActions = Array.isArray(rawQuickActions) ? rawQuickActions : [];

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const typo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const padding = useMemo(() => getCardPadding(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const divider = useMemo(() => createDividerStyle(tokens), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens, { color: tokens.colors.primaryScale[500] }), [tokens]);

    const [dateRange, setDateRange] = useState<DateRangeValue>('30d');
    const [costView, setCostView] = useState<'breakdown' | 'trend' | 'forecast'>('breakdown');
    const [selectedCostCategory, setSelectedCostCategory] = useState<string | null>(null);
    const [billingTab, setBillingTab] = useState<'overview' | 'usage' | 'invoices'>('overview');
    const [alertsExpanded, setAlertsExpanded] = useState(true);

    const hoverStylesBilling = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const entranceBilling = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entranceBilling.animate,
      transition: entranceBilling.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });
    const sectionHeaderBilling = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);

    const handleDateRange = useCallback((range: DateRangeValue) => {
      setDateRange(range);
      onDateRangeChange?.(range);
    }, [onDateRangeChange]);

    /* ── Shared styles ─────────────────────────────────────────────── */

    const cardBase = useMemo(() => createCardStyle(tokens, {
      elevation: 'sm',
      glass: isGlass,
    }), [tokens, isGlass]);

    const sectionTitle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[900],
      margin: 0,
    };

    const sectionSub: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.xs,
      color: tokens.colors.neutral[500],
      margin: 0,
    };

    const pillBtn = (active: boolean): React.CSSProperties => ({
      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.full,
      border: 'none',
      backgroundColor: active ? tokens.colors.primaryScale[600] : tokens.colors.neutral[100],
      color: active ? tokens.colors.common.white : tokens.colors.neutral[600],
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.medium,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: `all ${tokens.motion.hover}`,
    });

    const tabBtn = (active: boolean): React.CSSProperties => ({
      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
      borderRadius: tokens.borderRadius.none,
      border: 'none',
      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${active ? tokens.colors.primaryScale[600] : 'transparent'}`,
      backgroundColor: 'transparent',
      color: active ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: active ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: `all ${tokens.motion.hover}`,
    });

    /* ── Computed billing values ────────────────────────────────────── */

    const totalCost = costBreakdown.reduce((s, c) => s + c.amount, 0);
    const topCategory = costBreakdown.length > 0
      ? costBreakdown.reduce((top, c) => c.amount > top.amount ? c : top, costBreakdown[0])
      : null;

    const costAlerts = events.filter(e => e.type === 'quota_warning');

    /* ── Cost colors ───────────────────────────────────────────────── */

    const costColors = [
      tokens.colors.primaryScale[600],
      tokens.colors.secondaryScale[500],
      tokens.colors.successScale[500],
      tokens.colors.warningScale[500],
      tokens.colors.infoScale[500],
      tokens.colors.errorScale[400],
      tokens.colors.primaryScale[300],
      tokens.colors.secondaryScale[300],
    ];

    /* ── SVG Rendering ─────────────────────────────────────────────── */

    const renderAreaChartSvg = (
      data: number[],
      width: number,
      height: number,
      strokeColor: string,
      fillColorStart: string,
      fillColorEnd: string,
      showDots: boolean = true,
    ) => {
      if (data.length < 2) return null;
      const max = Math.max(...data, 1);
      const min = Math.min(...data, 0);
      const range = max - min || 1;
      const stepX = width / (data.length - 1);
      const padY = 10;
      const effectiveH = height - padY * 2;

      const points = data.map((v, i) => ({
        x: i * stepX,
        y: padY + effectiveH - ((v - min) / range) * effectiveH,
      }));

      const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const areaD = `${lineD} L ${((data.length - 1) * stepX).toFixed(1)} ${height} L 0 ${height} Z`;
      const gradientId = `billing-area-${Math.random().toString(36).slice(2, 8)}`;

      const skeleton = useMemo(() => createPersonalitySkeletonStyle(tokens), [tokens]);


      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColorStart} stopOpacity="0.5" />
              <stop offset="100%" stopColor={fillColorEnd} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gradientId})`} />
          <path d={lineD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {showDots && points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={tokens.colors.common.white} stroke={strokeColor} strokeWidth="2" />
          ))}
        </svg>
      );
    };

    const renderDonutChart = (
      segments: Array<{ label: string; value: number; color: string }>,
      size: number,
      centerLabel?: string,
      centerValue?: string,
    ) => {
      const total = segments.reduce((s, seg) => s + seg.value, 0);
      if (total === 0) return null;
      const radius = (size - 16) / 2;
      const cx = size / 2;
      const cy = size / 2;
      const innerRadius = radius * 0.65;
      let startAngle = -90;

      const paths = segments.map((seg) => {
        const angle = (seg.value / total) * 360;
        const endAngle = startAngle + angle;
        const largeArc = angle > 180 ? 1 : 0;

        const x1 = cx + radius * Math.cos((startAngle * Math.PI) / 180);
        const y1 = cy + radius * Math.sin((startAngle * Math.PI) / 180);
        const x2 = cx + radius * Math.cos((endAngle * Math.PI) / 180);
        const y2 = cy + radius * Math.sin((endAngle * Math.PI) / 180);
        const ix1 = cx + innerRadius * Math.cos((endAngle * Math.PI) / 180);
        const iy1 = cy + innerRadius * Math.sin((endAngle * Math.PI) / 180);
        const ix2 = cx + innerRadius * Math.cos((startAngle * Math.PI) / 180);
        const iy2 = cy + innerRadius * Math.sin((startAngle * Math.PI) / 180);

        const d = [
          `M ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
          `L ${ix1} ${iy1}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}`,
          'Z',
        ].join(' ');

        const isSelected = selectedCostCategory === seg.label;
        startAngle = endAngle;
        return (
          <path
            key={seg.label}
            d={d}
            fill={seg.color}
            opacity={selectedCostCategory && !isSelected ? 0.4 : 1}
            style={{ cursor: 'pointer', transition: `opacity ${tokens.transitions?.fast || tokens.motion.hover}` }}
            onClick={() => setSelectedCostCategory(isSelected ? null : seg.label)}
          />
        );
      });

      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {paths}
          {centerValue && (
            <>
              <text x={cx} y={cy - 6} textAnchor="middle" fontSize={tokens.typography.fontSize.lg} fontWeight={tokens.typography.fontWeight.bold} fill={tokens.colors.neutral[900]}>
                {centerValue}
              </text>
              {centerLabel && (
                <text x={cx} y={cy + 12} textAnchor="middle" fontSize={tokens.typography.fontSize.xs} fill={tokens.colors.neutral[500]}>
                  {centerLabel}
                </text>
              )}
            </>
          )}
        </svg>
      );
    };

    const renderStackedBarChart = (
      data: number[],
      width: number,
      height: number,
    ) => {
      if (data.length === 0) return null;
      const max = Math.max(...data, 1);
      const barWidth = Math.max(8, (width - (data.length - 1) * 4) / data.length);
      const gap = 4;

      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
          {data.map((v, i) => {
            const barH = (v / max) * (height - 4);
            const x = i * (barWidth + gap);
            const isLast = i === data.length - 1;
            return (
              <rect
                key={i}
                x={x} y={height - barH}
                width={barWidth} height={barH}
                rx={3}
                fill={isLast ? tokens.colors.primaryScale[500] : tokens.colors.primaryScale[200]}
                style={{ transition: `height ${tokens.transitions?.normal || tokens.motion.hover}` }}
              />
            );
          })}
        </svg>
      );
    };

    const renderGaugeChart = (value: number, max: number, color: string, size: number = 100) => {
      const pct = Math.min(value / max, 1);
      const radius = (size - 12) / 2;
      const circumference = Math.PI * radius;
      const strokeDashoffset = circumference - pct * circumference;

      return (
        <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
          <path
            d={`M 6 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 6} ${size / 2}`}
            fill="none" stroke={tokens.colors.neutral[100]} strokeWidth="8" strokeLinecap="round"
          />
          <path
            d={`M 6 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 6} ${size / 2}`}
            fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }}
          />
          <text x={size / 2} y={size / 2 - 2} textAnchor="middle" fontSize={tokens.typography.fontSize.lg} fontWeight={tokens.typography.fontWeight.bold} fill={tokens.colors.neutral[900]}>
            {formatPercentage(pct * 100)}
          </text>
        </svg>
      );
    };

    /* ── Trend helper ──────────────────────────────────────────────── */

    const renderTrend = (trend: number) => {
      const isUp = trend >= 0;
      const color = isUp ? tokens.colors.errorScale[600] : tokens.colors.successScale[600];
      const bg = isUp ? tokens.colors.errorScale[50] : tokens.colors.successScale[50];
      const Icon = isUp ? ArrowUpRight : ArrowDownRight;
      return (
        <Text style={{
          display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1],
          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.full,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.medium,
          color, backgroundColor: bg,
        }}>
          <Icon size={12} />
          {isUp ? '+' : ''}{trend.toFixed(1)}%
        </Text>
      );
    };

    /* ════════════════════════════════════════════════════════════════ */
    /* RENDER                                                          */
    /* ════════════════════════════════════════════════════════════════ */

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: tokens.colors.neutral[50],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <Box style={{
          padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
          backgroundColor: tokens.colors.common.white,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          ...(isGlass ? { backdropFilter: tokens.glass!.blur, WebkitBackdropFilter: tokens.glass!.blur, backgroundColor: tokens.glass!.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <Box style={{
                width: 36, height: 36, borderRadius: tokens.borderRadius.lg,
                background: `linear-gradient(135deg, ${tokens.colors.successScale[500]}, ${tokens.colors.primaryScale[600]})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Wallet size={18} color={tokens.colors.common.white} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{title}</Text>
                <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Token usage, cost allocation & spend forecasting</Text>
              </Box>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box style={{ display: 'flex', gap: tokens.spacing[1], padding: tokens.spacing[1], backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full }}>
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <Box key={opt.value} role="tab" tabIndex={0} aria-selected={dateRange === opt.value} onClick={() => handleDateRange(opt.value as DateRangeValue)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDateRange(opt.value as DateRangeValue); } }} style={pillBtn(dateRange === opt.value)}>
                    {opt.label}
                  </Box>
                ))}
              </Box>
              <Box role="button" tabIndex={0} aria-label="Refresh" onClick={onRefresh} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRefresh?.(); } }} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white, cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                color: tokens.colors.neutral[600],
              }}>
                <RefreshCw size={14} />
              </Box>
              <Box role="button" tabIndex={0} aria-label="Export report" onClick={onExportReport} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExportReport?.(); } }} style={{
                display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
              }}>
                <Download size={12} />
                Export Report
              </Box>
            </Box>
          </Box>

          {/* Tabs */}
          <Box style={{ display: 'flex', gap: 0, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, marginLeft: -tokens.spacing[5], marginRight: -tokens.spacing[5], paddingLeft: tokens.spacing[5] }}>
            {(['overview', 'usage', 'invoices'] as const).map((tab) => (
              <Box key={tab} role="tab" tabIndex={0} aria-selected={billingTab === tab} onClick={() => setBillingTab(tab)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setBillingTab(tab); } }} style={tabBtn(billingTab === tab)}>
                {(tab || '').charAt(0).toUpperCase() + (tab || '').slice(1)}
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Scrollable body ─────────────────────────────────────── */}
        <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[5] }}>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5], maxWidth: 1400, margin: '0 auto', width: '100%' }}>

            {/* ── Cost Alerts Banner ──────────────────────────────── */}
            {costAlerts.length > 0 && (
              <Box style={{
                ...createSurfaceStyle(tokens, { elevation: 'sm', borderColor: tokens.colors.warningScale[200] }),
                backgroundColor: tokens.colors.warningScale[50],
                padding: tokens.spacing[4],
              }}>
                <Box
                  role="button"
                  tabIndex={0}
                  aria-expanded={alertsExpanded}
                  aria-label={alertsExpanded ? 'Collapse cost alerts' : 'Expand cost alerts'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setAlertsExpanded(!alertsExpanded)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAlertsExpanded(!alertsExpanded); } }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <AlertTriangle size={16} color={tokens.colors.warningScale[600]} />
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.warningScale[800] }}>
                      {costAlerts.length} Cost Alert{costAlerts.length !== 1 ? 's' : ''}
                    </Text>
                  </Box>
                  <ChevronRight
                    size={14}
                    color={tokens.colors.warningScale[600]}
                    style={{ transform: alertsExpanded ? 'rotate(90deg)' : 'none', transition: `transform ${tokens.transitions?.normal || tokens.motion.hover}` }}
                  />
                </Box>
                {alertsExpanded && (
                  <Box style={{ marginTop: tokens.spacing[3], display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                    {costAlerts.map((alert) => (
                      <Box key={alert.id} role={onEventClick ? 'button' : undefined} tabIndex={onEventClick ? 0 : undefined} aria-label={onEventClick ? `View alert: ${alert.message}` : undefined} onClick={() => onEventClick?.(alert.id)} onKeyDown={onEventClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEventClick?.(alert.id); } } : undefined} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        backgroundColor: tokens.colors.common.white,
                        borderRadius: tokens.borderRadius.md,
                        cursor: onEventClick ? 'pointer' : 'default',
                      }}>
                        <Flame size={12} color={tokens.colors.warningScale[600]} />
                        <Text style={{ flex: 1, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{alert.message}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{alert.time}</Text>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* ── Hero Billing Stats ──────────────────────────────── */}
            {billing && (
              <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[4] }}>
                {/* Token Balance */}
                <Box style={{ ...cardBase, borderLeft: `3px solid ${tokens.colors.primaryScale[500]}` }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                    <Zap size={14} color={tokens.colors.primaryScale[600]} />
                    <Text style={sectionSub}>Token Balance</Text>
                  </Box>
                  <Text style={{ margin: 0, fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                    {formatTokenBalance(billing.tokenBalance)}
                  </Text>
                  <Box style={{ marginTop: tokens.spacing[2] }}>
                    {renderGaugeChart(
                      billing.tokenBalance,
                      billing.tokenBalance + billing.burnRate * billing.projectedRunwayDays,
                      tokens.colors.primaryScale[500],
                      80,
                    )}
                  </Box>
                </Box>

                {/* Daily Burn Rate */}
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], ...cardBase, borderLeft: `3px solid ${tokens.colors.warningScale[500]}` }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                    <Flame size={14} color={tokens.colors.warningScale[600]} />
                    <Text style={sectionSub}>Daily Burn Rate</Text>
                  </Box>
                  <Text style={{ margin: 0, fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                    {formatTokenBalance(billing.burnRate)}
                  </Text>
                  <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    tokens per day
                  </Text>
                  {billing.monthlyTrend.length >= 2 && (
                    <Box style={{ marginTop: tokens.spacing[2] }}>
                      {renderStackedBarChart(billing.monthlyTrend.slice(-7), 120, 40)}
                    </Box>
                  )}
                </Box>

                {/* Projected Runway */}
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], ...cardBase, borderLeft: `3px solid ${billing.projectedRunwayDays < 14 ? tokens.colors.errorScale[500] : billing.projectedRunwayDays < 30 ? tokens.colors.warningScale[500] : tokens.colors.successScale[500]}` }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                    <CalendarDays size={14} color={billing.projectedRunwayDays < 14 ? tokens.colors.errorScale[600] : tokens.colors.successScale[600]} />
                    <Text style={sectionSub}>Projected Runway</Text>
                  </Box>
                  <Text style={{ margin: 0, fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: billing.projectedRunwayDays < 14 ? tokens.colors.errorScale[600] : tokens.colors.neutral[900] }}>
                    {billing.projectedRunwayDays}
                  </Text>
                  <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    days remaining
                  </Text>
                  {billing.projectedRunwayDays < 14 && (
                    <Box style={{
                      marginTop: tokens.spacing[2],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      backgroundColor: tokens.colors.errorScale[50],
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.errorScale[700],
                      fontWeight: tokens.typography.fontWeight.medium,
                    }}>
                      Action required
                    </Box>
                  )}
                </Box>

                {/* Monthly Cost */}
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], ...cardBase, borderLeft: `3px solid ${tokens.colors.infoScale[500]}` }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                    <DollarSign size={14} color={tokens.colors.infoScale[600]} />
                    <Text style={sectionSub}>Monthly Cost</Text>
                  </Box>
                  <Text style={{ margin: 0, fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                    {formatCurrency(billing.monthlyCost)}
                  </Text>
                  <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    current billing period
                  </Text>
                </Box>
              </Box>
            )}

            {/* ── Token Usage Trend (large area chart) ───────────── */}
            {billing && billing.monthlyTrend.length > 0 && (
              <Box style={{ ...cardBase }}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <TrendingUp size={18} color={tokens.colors.primaryScale[600]} />
                    <Text style={sectionTitle}>Token Usage Trend</Text>
                  </Box>
                  <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                    {(['breakdown', 'trend', 'forecast'] as const).map((v) => (
                      <Box key={v} role="tab" tabIndex={0} aria-selected={costView === v} onClick={() => setCostView(v)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCostView(v); } }} style={pillBtn(costView === v)}>
                        {(v || '').charAt(0).toUpperCase() + (v || '').slice(1)}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box style={{ width: '100%', overflow: 'hidden' }}>
                  {costView === 'trend' || costView === 'forecast' ? (
                    renderAreaChartSvg(
                      costView === 'forecast'
                        ? [...billing.monthlyTrend, ...billing.monthlyTrend.slice(-3).map((v, i) => v * (0.95 + Math.random() * 0.15))]
                        : billing.monthlyTrend,
                      680,
                      220,
                      costView === 'forecast' ? tokens.colors.warningScale[500] : tokens.colors.primaryScale[500],
                      costView === 'forecast' ? tokens.colors.warningScale[400] : tokens.colors.primaryScale[400],
                      costView === 'forecast' ? tokens.colors.warningScale[50] : tokens.colors.primaryScale[50],
                    )
                  ) : (
                    renderAreaChartSvg(
                      billing.monthlyTrend,
                      680,
                      220,
                      tokens.colors.primaryScale[500],
                      tokens.colors.primaryScale[400],
                      tokens.colors.primaryScale[50],
                    )
                  )}
                </Box>
                {/* Legend for forecast */}
                {costView === 'forecast' && (
                  <Box style={{ display: 'flex', gap: tokens.spacing[4], marginTop: tokens.spacing[3], paddingTop: tokens.spacing[2], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                      <Box style={{ width: 12, height: 3, backgroundColor: tokens.colors.primaryScale[500], borderRadius: tokens.borderRadius.full, display: 'inline-block' }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Actual</Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                      <Box style={{ width: 12, height: 3, backgroundColor: tokens.colors.warningScale[500], borderRadius: tokens.borderRadius.full, display: 'inline-block' }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Projected</Text>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* ── Cost Allocation (donut + table) ────────────────── */}
            {costBreakdown.length > 0 && (
              <Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <PieChart size={18} color={tokens.colors.primaryScale[600]} />
                  <Text style={sectionTitle}>Cost Allocation</Text>
                </Box>
                <Box style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: tokens.spacing[4] }}>
                  {/* Donut */}
                  <Box style={{ ...cardBase, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {renderDonutChart(
                      costBreakdown.map((c, i) => ({
                        label: c.category,
                        value: c.amount,
                        color: costColors[i % costColors.length],
                      })),
                      180,
                      'total',
                      formatCurrency(totalCost),
                    )}
                    {/* Legend */}
                    <Box style={{ marginTop: tokens.spacing[3], width: '100%' }}>
                      {costBreakdown.map((c, i) => (
                        <Box
                          key={c.category}
                          role="button"
                          tabIndex={0}
                          aria-pressed={selectedCostCategory === c.category}
                          aria-label={`Filter by ${c.category}`}
                          onClick={() => setSelectedCostCategory(selectedCostCategory === c.category ? null : c.category)}
                          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedCostCategory(selectedCostCategory === c.category ? null : c.category); } }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
                            padding: `${tokens.spacing[1]}px 0`,
                            cursor: 'pointer',
                            opacity: selectedCostCategory && selectedCostCategory !== c.category ? 0.5 : 1,
                            transition: `opacity ${tokens.transitions?.fast || tokens.motion.hover}`,
                          }}
                        >
                          <Box style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: costColors[i % costColors.length], flexShrink: 0 }} />
                          <Text style={{ flex: 1, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{c.category}</Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{formatPercentage(c.percentage)}</Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Detailed cost table */}
                  <Box style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Category', 'Amount', '% of Total', 'Status'].map((col) => (
                            <th key={col} style={{
                              textAlign: 'left',
                              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[500],
                              backgroundColor: tokens.colors.neutral[50],
                              borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                            }}>
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {costBreakdown.map((c, i) => {
                          const isSelected = selectedCostCategory === c.category;
                          const isHighest = topCategory && c.category === topCategory.category;
                          return (
                            <tr
                              key={c.category}
                              onClick={() => setSelectedCostCategory(isSelected ? null : c.category)}
                              style={{
                                backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                                cursor: 'pointer',
                                transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                              }}
                            >
                              <td style={{
                                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                                fontSize: tokens.typography.fontSize.sm,
                                color: tokens.colors.neutral[900],
                                fontWeight: tokens.typography.fontWeight.medium,
                                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                              }}>
                                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                                  <Box style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: costColors[i % costColors.length] }} />
                                  {c.category}
                                </Box>
                              </td>
                              <td style={{
                                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                                fontSize: tokens.typography.fontSize.sm,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.neutral[800],
                                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                              }}>
                                {formatCurrency(c.amount)}
                              </td>
                              <td style={{
                                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                              }}>
                                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                                  <Box style={{ flex: 1, height: 6, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                                    <Box style={{ height: '100%', width: `${c.percentage}%`, backgroundColor: costColors[i % costColors.length], borderRadius: tokens.borderRadius.full }} />
                                  </Box>
                                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], width: 40 }}>{formatPercentage(c.percentage)}</Text>
                                </Box>
                              </td>
                              <td style={{
                                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                              }}>
                                {isHighest ? (
                                  <Text style={{ ...createBadgeStyle(tokens, 'warning') }}>Top spend</Text>
                                ) : c.percentage > 20 ? (
                                  <Text style={{ ...createBadgeStyle(tokens, 'info') }}>Monitor</Text>
                                ) : (
                                  <Text style={{ ...createBadgeStyle(tokens, 'success') }}>Normal</Text>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              </Box>
            )}

            {/* ── Provider Cost & KPI Row ─────────────────────────── */}
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
              {/* Provider costs */}
              {providers.length > 0 && (
                <Box style={{ ...cardBase }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                    <Layers size={16} color={tokens.colors.primaryScale[600]} />
                    <Text style={sectionTitle}>Provider Costs</Text>
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                    {providers.map((provider, i) => {
                      const latencyColor = provider.latencyMs < 150
                        ? tokens.colors.successScale[500]
                        : provider.latencyMs < 300
                          ? tokens.colors.warningScale[500]
                          : tokens.colors.errorScale[500];
                      return (
                        <Box
                          key={provider.id}
                          role={onProviderClick ? 'button' : undefined}
                          tabIndex={onProviderClick ? 0 : undefined}
                          aria-label={onProviderClick ? `View provider: ${provider.name}` : undefined}
                          onClick={() => onProviderClick?.(provider.id)}
                          onKeyDown={onProviderClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onProviderClick?.(provider.id); } } : undefined}
                          style={{
                            ...animStyle(i),
                            display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                            padding: tokens.spacing[3],
                            borderRadius: tokens.borderRadius.md,
                            backgroundColor: tokens.colors.neutral[50],
                            cursor: onProviderClick ? 'pointer' : 'default',
                            transition: `all ${tokens.motion.hover}`,
                          }}
                        >
                          <Box style={{
                            width: 8, height: 8, borderRadius: tokens.borderRadius.full,
                            backgroundColor: getProviderStatusColors(tokens)[provider.status].dot,
                            flexShrink: 0,
                          }} />
                          <Text style={{ flex: 1, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                            {provider.name}
                          </Text>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                            <Gauge size={12} color={latencyColor} />
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: latencyColor, fontWeight: tokens.typography.fontWeight.medium }}>
                              {provider.latencyMs}ms
                            </Text>
                          </Box>
                          <Text style={{
                            ...createBadgeStyle(tokens, provider.status === 'healthy' ? 'success' : provider.status === 'degraded' ? 'warning' : 'error'),
                          }}>
                            {provider.status}
                          </Text>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* Billing KPIs */}
              {kpis.length > 0 && (
                <Box style={{ ...cardBase }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                    <BarChart3 size={16} color={tokens.colors.primaryScale[600]} />
                    <Text style={sectionTitle}>Key Metrics</Text>
                  </Box>
                  <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[3] }}>
                    {kpis.slice(0, 4).map((kpi, i) => (
                      <Box key={i} style={{
                        ...animStyle(i),
                        padding: tokens.spacing[3],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.neutral[50],
                      }}>
                        <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>{kpi.label}</Text>
                        <Box style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                            {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                          </Text>
                          {renderTrend(kpi.trend)}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            {/* ── Compliance & Quick Actions ──────────────────────── */}
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
              {/* Compliance */}
              {compliance && (
                <Box style={{ ...cardBase }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                    <Shield size={16} color={tokens.colors.primaryScale[600]} />
                    <Text style={sectionTitle}>Compliance</Text>
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                    {/* Data Retention */}
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: complianceColors[compliance.dataRetention].bg,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${complianceColors[compliance.dataRetention].border}`,
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Lock size={14} color={complianceColors[compliance.dataRetention].color} />
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>Data Retention</Text>
                      </Box>
                      <Text style={{
                        ...createBadgeStyle(tokens, compliance.dataRetention === 'ok' ? 'success' : compliance.dataRetention === 'warning' ? 'warning' : 'error'),
                      }}>
                        {(compliance.dataRetention || '').toUpperCase()}
                      </Text>
                    </Box>
                    {/* GDPR */}
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Globe size={14} color={tokens.colors.infoScale[600]} />
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>GDPR Requests</Text>
                      </Box>
                      <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                        {compliance.gdprRequests}
                      </Text>
                    </Box>
                    {/* Audit */}
                    <Box style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                          <FileText size={14} color={compliance.auditCompleteness >= 90 ? tokens.colors.successScale[600] : tokens.colors.warningScale[600]} />
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>Audit Completeness</Text>
                        </Box>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                          {formatPercentage(compliance.auditCompleteness)}
                        </Text>
                      </Box>
                      <svg width="100%" height="8" style={{ display: 'block' }}>
                        <rect x="0" y="0" width="100%" height="8" rx="4" fill={tokens.colors.neutral[200]} />
                        <rect
                          x="0" y="0"
                          width={`${compliance.auditCompleteness}%`}
                          height="8" rx="4"
                          fill={compliance.auditCompleteness >= 90 ? tokens.colors.successScale[500] : compliance.auditCompleteness >= 70 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500]}
                          style={{ transition: `width ${tokens.transitions?.normal || tokens.motion.hover}` }}
                        />
                      </svg>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Quick Actions */}
              {quickActions.length > 0 && (
                <Box style={{ ...cardBase }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                    <Zap size={16} color={tokens.colors.primaryScale[600]} />
                    <Text style={sectionTitle}>Quick Actions</Text>
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                    {quickActions.map((action, i) => (
                      <Box
                        as="button"
                        key={action.key}
                        onClick={() => onQuickAction?.(action.key)}
                        style={{
                          ...animStyle(i),
                          display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
                          padding: tokens.spacing[3],
                          borderRadius: tokens.borderRadius.md,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          backgroundColor: tokens.colors.common.white,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          textAlign: 'left',
                          width: '100%',
                          transition: `all ${tokens.motion.hover}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = tokens.colors.primaryScale[300];
                          e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[50];
                          e.currentTarget.style.transform = tokens.motion.transform;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = tokens.colors.neutral[200];
                          e.currentTarget.style.backgroundColor = tokens.colors.common.white;
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <Text style={{
                          width: 32, height: 32, borderRadius: tokens.borderRadius.md,
                          backgroundColor: tokens.colors.primaryScale[50],
                          color: tokens.colors.primaryScale[600],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {action.icon}
                        </Text>
                        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], flex: 1 }}>
                          <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>
                            {action.label}
                          </Text>
                          <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                            {action.description}
                          </Text>
                        </Box>
                        <ChevronRight size={14} color={tokens.colors.neutral[400]} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

          </Box>
        </Box>
      </Box>
    );
  },
});
