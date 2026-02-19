'use client';

/**
 * BhAdminCenter - Overview Preset
 * Full admin dashboard: system health, providers, billing summary,
 * KPIs, users, events, cost breakdown, compliance, quick actions
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
  getCircuitBreakerColors,
  getSeverityColors,
  getComplianceColors,
  formatTokenBalance,
  formatCurrency,
  formatPercentage,
  DATE_RANGE_OPTIONS,
} from '../../core';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Database,
  FileText,
  Globe,
  Layers,
  LifeBuoy,
  Lock,
  RefreshCw,
  Server,
  Settings,
  Shield,
  TrendingDown,
  TrendingUp,
  UserCog,
  Users,
  Zap,
} from 'lucide-react';

export const OverviewBhAdminCenter = createPreset<BhAdminCenterProps>({
  name: 'BhAdminCenter.Overview',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhAdminCenterProps>) => {
    const { Box, Text } = primitives;
    const providerStatusColors = getProviderStatusColors(tokens);
    const circuitBreakerColors = getCircuitBreakerColors(tokens);
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
      title = 'Admin Center',
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
    const [providerFilter, setProviderFilter] = useState<string>('all');
    const [costView, setCostView] = useState<'bar' | 'treemap'>('bar');
    const [eventFilter, setEventFilter] = useState<string>('all');
    const [systemStatus, setSystemStatus] = useState<'live' | 'paused'>('live');

    const hoverStylesAdmin = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const entranceAdmin = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entranceAdmin.animate,
      transition: entranceAdmin.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);

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

    const gridTwo: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: tokens.spacing[4],
    };

    const gridThree: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: tokens.spacing[4],
    };

    const gridFour: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: tokens.spacing[4],
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

    /* ── Provider helpers ──────────────────────────────────────────── */

    const filteredProviders = providerFilter === 'all'
      ? providers
      : providers.filter(p => p.status === providerFilter);

    const providerStatuses = ['all', 'healthy', 'degraded', 'down'] as const;

    const filteredEvents = eventFilter === 'all'
      ? events
      : events.filter(e => e.type === eventFilter);

    const eventTypes = ['all', 'provider_failure', 'quota_warning', 'security_alert'] as const;
    const eventTypeLabels: Record<string, string> = {
      all: 'All',
      provider_failure: 'Provider',
      quota_warning: 'Quota',
      security_alert: 'Security',
    };

    /* ── SVG Helpers ───────────────────────────────────────────────── */

    const renderStatusCircleSvg = (
      value: number,
      total: number,
      label: string,
      color: string,
      bgColor: string,
      icon: React.ReactNode,
    ) => {
      const pct = total > 0 ? (value / total) * 100 : 0;
      const radius = 36;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = circumference - (pct / 100) * circumference;

      return (
        <Box style={{ ...cardBase, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: tokens.spacing[5], gap: tokens.spacing[3] }}>
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r={radius} fill="none" stroke={bgColor} strokeWidth="6" />
            <circle
              cx="44" cy="44" r={radius}
              fill="none" stroke={color} strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 44 44)"
              style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }}
            />
            <foreignObject x="22" y="26" width="44" height="36">
              <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], marginTop: tokens.spacing[1] }}>
                  {formatPercentage(pct)}
                </Text>
              </Box>
            </foreignObject>
          </svg>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], textAlign: 'center' }}>
            <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
              {typeof value === 'number' && typeof total === 'number' && total !== 100 ? `${value} / ${total}` : formatPercentage(pct)}
            </Text>
            <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{label}</Text>
          </Box>
        </Box>
      );
    };

    const renderLatencyBar = (latencyMs: number, maxMs: number = 500) => {
      const pct = Math.min((latencyMs / maxMs) * 100, 100);
      const barColor = latencyMs < 150
        ? tokens.colors.successScale[500]
        : latencyMs < 300
          ? tokens.colors.warningScale[500]
          : tokens.colors.errorScale[500];

      return (
        <svg width="100%" height="8" style={{ display: 'block' }}>
          <rect x="0" y="0" width="100%" height="8" rx="4" fill={tokens.colors.neutral[100]} />
          <rect x="0" y="0" width={`${pct}%`} height="8" rx="4" fill={barColor} style={{ transition: `width ${tokens.transitions?.normal || tokens.motion.hover}` }} />
        </svg>
      );
    };

    const renderAreaChartSvg = (
      data: number[],
      width: number,
      height: number,
      strokeColor: string,
      fillColorStart: string,
      fillColorEnd: string,
    ) => {
      if (data.length < 2) return null;
      const max = Math.max(...data, 1);
      const min = Math.min(...data, 0);
      const range = max - min || 1;
      const stepX = width / (data.length - 1);
      const padY = 8;
      const effectiveH = height - padY * 2;

      const points = data.map((v, i) => ({
        x: i * stepX,
        y: padY + effectiveH - ((v - min) / range) * effectiveH,
      }));

      const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      const areaD = `${lineD} L ${((data.length - 1) * stepX).toFixed(1)} ${height} L 0 ${height} Z`;

      const gradientId = `area-grad-${Math.random().toString(36).slice(2, 8)}`;

      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColorStart} stopOpacity="0.4" />
              <stop offset="100%" stopColor={fillColorEnd} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gradientId})`} />
          <path d={lineD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={tokens.colors.common.white} stroke={strokeColor} strokeWidth="1.5" />
          ))}
        </svg>
      );
    };

    const renderDonutChart = (
      segments: Array<{ label: string; value: number; color: string }>,
      size: number,
    ) => {
      const total = segments.reduce((s, seg) => s + seg.value, 0);
      if (total === 0) return null;
      const radius = (size - 16) / 2;
      const cx = size / 2;
      const cy = size / 2;
      const innerRadius = radius * 0.6;
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

        startAngle = endAngle;
        return <path key={seg.label} d={d} fill={seg.color} />;
      });

      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {paths}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize={tokens.typography.fontSize.lg} fontWeight={tokens.typography.fontWeight.bold} fill={tokens.colors.neutral[900]}>
            {total}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize={tokens.typography.fontSize.xs} fill={tokens.colors.neutral[500]}>
            total
          </text>
        </svg>
      );
    };

    const renderBarChart = (
      items: Array<{ label: string; value: number; color: string }>,
      barHeight: number = 24,
    ) => {
      const max = Math.max(...items.map(i => i.value), 1);
      return (
        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
          {items.map((item) => {
            const widthPct = (item.value / max) * 100;
            return (
              <Box key={item.label} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], width: 90, flexShrink: 0, textAlign: 'right' }}>{item.label}</Text>
                <Box style={{ flex: 1, position: 'relative', height: barHeight, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.sm, overflow: 'hidden' }}>
                  <Box style={{
                    height: '100%',
                    width: `${widthPct}%`,
                    backgroundColor: item.color,
                    borderRadius: tokens.borderRadius.sm,
                    transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                  }} />
                </Box>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], width: 60, flexShrink: 0 }}>
                  {formatCurrency(item.value)}
                </Text>
              </Box>
            );
          })}
        </Box>
      );
    };

    const renderTreemap = (
      items: Array<{ label: string; value: number; color: string }>,
      width: number,
      height: number,
    ) => {
      const total = items.reduce((s, i) => s + i.value, 0);
      if (total === 0) return null;
      let currentX = 0;

      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', borderRadius: tokens.borderRadius.md, overflow: 'hidden' }}>
          {items.map((item) => {
            const w = (item.value / total) * width;
            const x = currentX;
            currentX += w;
            return (
              <g key={item.label}>
                <rect x={x} y={0} width={w} height={height} fill={item.color} />
                {w > 50 && (
                  <>
                    <text x={x + w / 2} y={height / 2 - 6} textAnchor="middle" fontSize={tokens.typography.fontSize.xs} fontWeight={tokens.typography.fontWeight.semibold} fill={tokens.colors.common.white}>
                      {item.label}
                    </text>
                    <text x={x + w / 2} y={height / 2 + 10} textAnchor="middle" fontSize={tokens.typography.fontSize.xs} fill={tokens.colors.common.white} opacity="0.8">
                      {formatPercentage(item.value / total * 100)}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      );
    };

    /* ── Donut role colors ─────────────────────────────────────────── */

    const roleColors = [
      tokens.colors.primaryScale[500],
      tokens.colors.secondaryScale[500],
      tokens.colors.successScale[500],
      tokens.colors.warningScale[500],
      tokens.colors.infoScale[500],
      tokens.colors.errorScale[400],
      tokens.colors.primaryScale[300],
      tokens.colors.secondaryScale[300],
    ];

    const costColors = [
      tokens.colors.primaryScale[600],
      tokens.colors.secondaryScale[500],
      tokens.colors.successScale[500],
      tokens.colors.warningScale[500],
      tokens.colors.infoScale[500],
      tokens.colors.errorScale[400],
      tokens.colors.primaryScale[300],
    ];

    /* ── Trend icon ────────────────────────────────────────────────── */

    const renderTrend = (trend: number) => {
      const isUp = trend >= 0;
      const color = isUp ? tokens.colors.successScale[600] : tokens.colors.errorScale[600];
      const bg = isUp ? tokens.colors.successScale[50] : tokens.colors.errorScale[50];
      const Icon = isUp ? TrendingUp : TrendingDown;
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
          {isUp ? '+' : ''}{(trend ?? 0).toFixed(1)}%
        </Text>
      );
    };

    /* ── Event icon map ────────────────────────────────────────────── */

    const eventIcons: Record<string, React.ReactNode> = {
      provider_failure: <Server size={14} />,
      quota_warning: <AlertTriangle size={14} />,
      security_alert: <Shield size={14} />,
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...(isGlass ? { backdropFilter: tokens.glass!.blur, WebkitBackdropFilter: tokens.glass!.blur, backgroundColor: tokens.glass!.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={{
              width: 36, height: 36, borderRadius: tokens.borderRadius.lg,
              background: `linear-gradient(135deg, ${tokens.colors.primaryScale[500]}, ${tokens.colors.primaryScale[700]})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Settings size={18} color={tokens.colors.common.white} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
              <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{title}</Text>
              <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>BitHire ATS Platform Administration</Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {/* Date range pills */}
            <Box style={{ display: 'flex', gap: tokens.spacing[1], padding: tokens.spacing[1], backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full }}>
              {DATE_RANGE_OPTIONS.map((opt) => (
                <Box key={opt.value} role="tab" tabIndex={0} aria-selected={dateRange === opt.value} onClick={() => handleDateRange(opt.value as DateRangeValue)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDateRange(opt.value as DateRangeValue); } }} style={pillBtn(dateRange === opt.value)}>
                  {opt.label}
                </Box>
              ))}
            </Box>
            {/* Live / Paused toggle */}
            <Box
              onClick={() => setSystemStatus(systemStatus === 'live' ? 'paused' : 'live')}
              role="button"
              tabIndex={0}
              aria-label={systemStatus === 'live' ? 'Pause system monitoring' : 'Resume system monitoring'}
              aria-pressed={systemStatus === 'live'}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSystemStatus(systemStatus === 'live' ? 'paused' : 'live'); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.full,
                border: 'none',
                backgroundColor: systemStatus === 'live' ? tokens.colors.successScale[50] : tokens.colors.neutral[100],
                color: systemStatus === 'live' ? tokens.colors.successScale[700] : tokens.colors.neutral[600],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Box style={{
                width: 6, height: 6, borderRadius: tokens.borderRadius.full,
                backgroundColor: systemStatus === 'live' ? tokens.colors.successScale[500] : tokens.colors.neutral[400],
              }} />
              {systemStatus === 'live' ? 'Live' : 'Paused'}
            </Box>
            {/* Refresh */}
            <Box onClick={onRefresh} role="button" tabIndex={0} aria-label="Refresh dashboard" onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRefresh?.(); } }} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white, cursor: 'pointer',
              color: tokens.colors.neutral[600], transition: `all ${tokens.motion.hover}`,
            }}>
              <RefreshCw size={14} />
            </Box>
            {/* Export */}
            <Box onClick={onExportReport} role="button" tabIndex={0} aria-label="Export report" onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExportReport?.(); } }} style={{
              display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: `all ${tokens.motion.hover}`,
            }}>
              <FileText size={12} />
              Export
            </Box>
          </Box>
        </Box>

        {/* ── Scrollable body ─────────────────────────────────────── */}
        <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[5] }}>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5], maxWidth: 1400, margin: '0 auto', width: '100%' }}>

            {/* ── 1. System Health Hero ──────────────────────────── */}
            {systemHealth && (
              <Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <Activity size={18} color={tokens.colors.primaryScale[600]} />
                  <Text style={sectionTitle}>System Health</Text>
                </Box>
                <Box style={gridFour}>
                  {renderStatusCircleSvg(
                    systemHealth.providersUp ?? 0,
                    systemHealth.providersTotal ?? 0,
                    'Providers Up',
                    tokens.colors.successScale[500],
                    tokens.colors.successScale[100],
                    <Server size={16} color={tokens.colors.successScale[600]} />,
                  )}
                  {renderStatusCircleSvg(
                    systemHealth.interviewsRunning ?? 0,
                    100,
                    'Interviews Running',
                    tokens.colors.infoScale[500],
                    tokens.colors.infoScale[100],
                    <Users size={16} color={tokens.colors.infoScale[600]} />,
                  )}
                  {renderStatusCircleSvg(
                    Math.min(systemHealth.tokenBalance ?? 0, 100),
                    100,
                    `Token Balance: ${formatTokenBalance(systemHealth.tokenBalance ?? 0)}`,
                    tokens.colors.primaryScale[500],
                    tokens.colors.primaryScale[100],
                    <Zap size={16} color={tokens.colors.primaryScale[600]} />,
                  )}
                  {renderStatusCircleSvg(
                    systemHealth.slaCompliance ?? 0,
                    100,
                    'SLA Compliance',
                    (systemHealth.slaCompliance ?? 0) >= 95 ? tokens.colors.successScale[500] : (systemHealth.slaCompliance ?? 0) >= 80 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500],
                    (systemHealth.slaCompliance ?? 0) >= 95 ? tokens.colors.successScale[100] : (systemHealth.slaCompliance ?? 0) >= 80 ? tokens.colors.warningScale[100] : tokens.colors.errorScale[100],
                    <Shield size={16} color={(systemHealth.slaCompliance ?? 0) >= 95 ? tokens.colors.successScale[600] : (systemHealth.slaCompliance ?? 0) >= 80 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600]} />,
                  )}
                </Box>
              </Box>
            )}

            {/* ── 2. Provider Health Grid ────────────────────────── */}
            {providers.length > 0 && (
              <Box>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Server size={18} color={tokens.colors.primaryScale[600]} />
                    <Text style={sectionTitle}>Provider Health</Text>
                    <Text style={{ ...createBadgeStyle(tokens, 'primary'), marginLeft: tokens.spacing[1] }}>{providers.length} providers</Text>
                  </Box>
                  <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                    {providerStatuses.map((s) => (
                      <Box key={s} role="tab" tabIndex={0} aria-selected={providerFilter === s} onClick={() => setProviderFilter(s)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setProviderFilter(s); } }} style={pillBtn(providerFilter === s)}>
                        {s === 'all' ? 'All' : (s || '').charAt(0).toUpperCase() + (s || '').slice(1)}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box style={gridThree}>
                  {filteredProviders.map((provider, i) => {
                    const sc = providerStatusColors[provider.status];
                    const cb = circuitBreakerColors[provider.circuitBreaker];
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
                          ...cardBase,
                          cursor: onProviderClick ? 'pointer' : 'default',
                          transition: `all ${tokens.motion.hover}`,
                          borderLeft: `3px solid ${sc.dot}`,
                        }}
                      >
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <Box style={{
                              width: 8, height: 8, borderRadius: tokens.borderRadius.full,
                              backgroundColor: sc.dot,
                              display: 'inline-block',
                            }} />
                            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                              {provider.name}
                            </Text>
                          </Box>
                          <Text style={{
                            ...createBadgeStyle(tokens, provider.status === 'healthy' ? 'success' : provider.status === 'degraded' ? 'warning' : 'error'),
                          }}>
                            {provider.status}
                          </Text>
                        </Box>

                        {/* Latency bar */}
                        <Box style={{ marginBottom: tokens.spacing[2] }}>
                          <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Latency</Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{provider.latencyMs}ms</Text>
                          </Box>
                          {renderLatencyBar(provider.latencyMs)}
                        </Box>

                        {/* Circuit breaker + last checked */}
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing[2] }}>
                          <Text style={{
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            backgroundColor: cb.bg, color: cb.color,
                          }}>
                            CB: {provider.circuitBreaker}
                          </Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                            <Clock size={10} />
                            {provider.lastChecked}
                          </Text>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* ── 3. Billing Summary ─────────────────────────────── */}
            {billing && (
              <Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <CreditCard size={18} color={tokens.colors.primaryScale[600]} />
                  <Text style={sectionTitle}>Billing Summary</Text>
                </Box>
                <Box style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: tokens.spacing[4] }}>
                  {/* Stats cards */}
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                    {/* Token balance */}
                    <Box style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                      <Text style={sectionSub}>Token Balance</Text>
                      <Text style={{ margin: 0, fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                        {formatTokenBalance(billing.tokenBalance ?? 0)}
                      </Text>
                    </Box>
                    {/* Burn rate */}
                    <Box style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                      <Text style={sectionSub}>Burn Rate</Text>
                      <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                        {formatTokenBalance(billing.burnRate ?? 0)}<Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.normal, color: tokens.colors.neutral[500] }}>/day</Text>
                      </Text>
                    </Box>
                    {/* Projected runway */}
                    <Box style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                      <Text style={sectionSub}>Projected Runway</Text>
                      <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                        {billing.projectedRunwayDays ?? 0} <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.normal, color: tokens.colors.neutral[500] }}>days</Text>
                      </Text>
                    </Box>
                    {/* Monthly cost */}
                    <Box style={{ ...cardBase, display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                      <Text style={sectionSub}>Monthly Cost</Text>
                      <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                        {formatCurrency(billing.monthlyCost ?? 0)}
                      </Text>
                    </Box>
                  </Box>

                  {/* Area chart */}
                  <Box style={{ ...cardBase, display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ ...sectionSub, marginBottom: tokens.spacing[3] }}>Monthly Token Trend</Text>
                    <Box style={{ flex: 1, minHeight: 200 }}>
                      {renderAreaChartSvg(
                        billing.monthlyTrend ?? [],
                        520,
                        200,
                        tokens.colors.primaryScale[500],
                        tokens.colors.primaryScale[400],
                        tokens.colors.primaryScale[100],
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {/* ── 4. Global Hiring Metrics ───────────────────────── */}
            {kpis.length > 0 && (
              <Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <BarChart3 size={18} color={tokens.colors.primaryScale[600]} />
                  <Text style={sectionTitle}>Global Hiring Metrics</Text>
                </Box>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[4] }}>
                  {kpis.slice(0, 6).map((kpi, i) => (
                    <Box key={i} style={{ ...animStyle(i), ...cardBase }}>
                      <Text style={{ ...sectionSub, marginBottom: tokens.spacing[1] }}>{kpi.label ?? ''}</Text>
                      <Box style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <Text style={{ margin: 0, fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                          {typeof kpi.value === 'number' ? (kpi.value ?? 0).toLocaleString() : (kpi.value ?? '')}
                        </Text>
                        {renderTrend(kpi.trend ?? 0)}
                      </Box>
                      <Text style={{ margin: 0, marginTop: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        vs prev: {typeof kpi.previousValue === 'number' ? (kpi.previousValue ?? 0).toLocaleString() : (kpi.previousValue ?? '')}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* ── 5 & 6. Users + Events side by side ─────────────── */}
            <Box style={gridTwo}>
              {/* 5. User Management Summary */}
              {users && (
                <Box style={{ ...cardBase }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                    <UserCog size={18} color={tokens.colors.primaryScale[600]} />
                    <Text style={sectionTitle}>User Management</Text>
                  </Box>
                  <Box style={{ display: 'flex', gap: tokens.spacing[4] }}>
                    {/* Donut */}
                    <Box>
                      {renderDonutChart(
                        Object.entries(users.byRole ?? {}).map(([role, count], i) => ({
                          label: role,
                          value: count,
                          color: roleColors[i % roleColors.length],
                        })),
                        140,
                      )}
                    </Box>
                    {/* Legend + stats */}
                    <Box style={{ flex: 1 }}>
                      <Box style={{ marginBottom: tokens.spacing[3], display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                        <Text style={sectionSub}>Total Users</Text>
                        <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                          {(users.totalUsers || 0).toLocaleString()}
                        </Text>
                      </Box>
                      <Box style={{ marginBottom: tokens.spacing[3], display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                        <Text style={sectionSub}>Recent Invitations</Text>
                        <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                          {users.recentInvitations}
                        </Text>
                      </Box>
                      {/* Role legend */}
                      <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                        {Object.entries(users.byRole ?? {}).map(([role, count], i) => (
                          <Box key={role} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <Box style={{
                              width: 8, height: 8, borderRadius: tokens.borderRadius.full,
                              backgroundColor: roleColors[i % roleColors.length],
                              flexShrink: 0,
                            }} />
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], flex: 1 }}>{role}</Text>
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{count}</Text>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* 6. Recent System Events */}
              <Box style={{ ...cardBase, display: 'flex', flexDirection: 'column' }}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <AlertTriangle size={18} color={tokens.colors.warningScale[600]} />
                    <Text style={sectionTitle}>System Events</Text>
                    {events.length > 0 && (
                      <Text style={{ ...createBadgeStyle(tokens, 'warning') }}>{events.length}</Text>
                    )}
                  </Box>
                  <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                    {eventTypes.map((t) => (
                      <Box key={t} role="tab" tabIndex={0} aria-selected={eventFilter === t} onClick={() => setEventFilter(t)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEventFilter(t); } }} style={pillBtn(eventFilter === t)}>
                        {eventTypeLabels[t]}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  {filteredEvents.length === 0 ? (
                    <Box style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                      No events to display
                    </Box>
                  ) : (
                    filteredEvents.map((evt, i) => {
                      const sc = severityColors[evt.severity ?? 'low'] ?? severityColors.low;
                      return (
                        <Box
                          key={evt.id}
                          role={onEventClick ? 'button' : undefined}
                          tabIndex={onEventClick ? 0 : undefined}
                          aria-label={onEventClick ? `View event: ${evt.message ?? ''}` : undefined}
                          onClick={() => onEventClick?.(evt.id)}
                          onKeyDown={onEventClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEventClick?.(evt.id); } } : undefined}
                          style={{
                            ...animStyle(i),
                            display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[3],
                            padding: tokens.spacing[3],
                            borderRadius: tokens.borderRadius.md,
                            backgroundColor: sc.bg,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sc.border}`,
                            cursor: onEventClick ? 'pointer' : 'default',
                            transition: `all ${tokens.motion.hover}`,
                          }}
                        >
                          <Text style={{ color: sc.color, flexShrink: 0, marginTop: tokens.spacing[1] }}>
                            {eventIcons[evt.type] ?? <AlertTriangle size={14} />}
                          </Text>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>
                              {evt.message ?? ''}
                            </Text>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[1] }}>
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{evt.time ?? ''}</Text>
                              <Text style={{
                                padding: `0 ${tokens.spacing[2]}px`,
                                borderRadius: tokens.borderRadius.full,
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.medium,
                                backgroundColor: sc.bg, color: sc.color,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sc.border}`,
                              }}>
                                {evt.severity}
                              </Text>
                            </Box>
                          </Box>
                          <ChevronRight size={14} color={tokens.colors.neutral[400]} style={{ flexShrink: 0, marginTop: tokens.spacing[1] }} />
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>
            </Box>

            {/* ── 7. Cost Breakdown ──────────────────────────────── */}
            {costBreakdown.length > 0 && (
              <Box>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Layers size={18} color={tokens.colors.primaryScale[600]} />
                    <Text style={sectionTitle}>Cost Breakdown</Text>
                  </Box>
                  <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                    <Box role="tab" tabIndex={0} aria-selected={costView === 'bar'} onClick={() => setCostView('bar')} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCostView('bar'); } }} style={pillBtn(costView === 'bar')}>Bar</Box>
                    <Box role="tab" tabIndex={0} aria-selected={costView === 'treemap'} onClick={() => setCostView('treemap')} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCostView('treemap'); } }} style={pillBtn(costView === 'treemap')}>Treemap</Box>
                  </Box>
                </Box>
                <Box style={{ ...cardBase }}>
                  {costView === 'bar' ? (
                    renderBarChart(
                      costBreakdown.map((c, i) => ({
                        label: c.category,
                        value: c.amount,
                        color: costColors[i % costColors.length],
                      })),
                    )
                  ) : (
                    renderTreemap(
                      costBreakdown.map((c, i) => ({
                        label: c.category,
                        value: c.amount,
                        color: costColors[i % costColors.length],
                      })),
                      800,
                      120,
                    )
                  )}
                </Box>
              </Box>
            )}

            {/* ── 8. Compliance Dashboard ────────────────────────── */}
            {compliance && (
              <Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <Lock size={18} color={tokens.colors.primaryScale[600]} />
                  <Text style={sectionTitle}>Compliance Dashboard</Text>
                </Box>
                <Box style={gridThree}>
                  {/* Data Retention */}
                  <Box style={{ ...cardBase, borderTop: `3px solid ${(complianceColors[compliance.dataRetention ?? 'ok'] ?? complianceColors.ok).color}` }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                      <Database size={16} color={(complianceColors[compliance.dataRetention ?? 'ok'] ?? complianceColors.ok).color} />
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Data Retention</Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Text style={{
                        ...createBadgeStyle(tokens, (compliance.dataRetention ?? 'ok') === 'ok' ? 'success' : (compliance.dataRetention ?? 'ok') === 'warning' ? 'warning' : 'error'),
                      }}>
                        {compliance.dataRetention === 'ok' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        <Text style={{ marginLeft: 4 }}>{(compliance.dataRetention || '').toUpperCase()}</Text>
                      </Text>
                    </Box>
                    <Text style={{ margin: 0, marginTop: tokens.spacing[2], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      Retention policies are {(compliance.dataRetention ?? 'ok') === 'ok' ? 'compliant' : 'requiring attention'}
                    </Text>
                  </Box>

                  {/* GDPR Requests */}
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1], ...cardBase, borderTop: `3px solid ${tokens.colors.infoScale[500]}` }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                      <Globe size={16} color={tokens.colors.infoScale[600]} />
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>GDPR Requests</Text>
                    </Box>
                    <Text style={{ margin: 0, fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                      {compliance.gdprRequests ?? 0}
                    </Text>
                    <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      Pending data subject requests
                    </Text>
                  </Box>

                  {/* Audit Completeness */}
                  <Box style={{ ...cardBase, borderTop: `3px solid ${(compliance.auditCompleteness ?? 0) >= 90 ? tokens.colors.successScale[500] : (compliance.auditCompleteness ?? 0) >= 70 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500]}` }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                      <FileText size={16} color={(compliance.auditCompleteness ?? 0) >= 90 ? tokens.colors.successScale[600] : (compliance.auditCompleteness ?? 0) >= 70 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600]} />
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Audit Completeness</Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'flex-end', gap: tokens.spacing[2] }}>
                      <Text style={{ margin: 0, fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                        {formatPercentage(compliance.auditCompleteness ?? 0)}
                      </Text>
                    </Box>
                    <Box style={{ marginTop: tokens.spacing[2] }}>
                      <svg width="100%" height="8" style={{ display: 'block' }}>
                        <rect x="0" y="0" width="100%" height="8" rx="4" fill={tokens.colors.neutral[100]} />
                        <rect
                          x="0" y="0"
                          width={`${compliance.auditCompleteness ?? 0}%`}
                          height="8" rx="4"
                          fill={(compliance.auditCompleteness ?? 0) >= 90 ? tokens.colors.successScale[500] : (compliance.auditCompleteness ?? 0) >= 70 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500]}
                          style={{ transition: `width ${tokens.transitions?.normal || tokens.motion.hover}` }}
                        />
                      </svg>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {/* ── 9. Quick Config Actions ────────────────────────── */}
            {quickActions.length > 0 && (
              <Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <Zap size={18} color={tokens.colors.primaryScale[600]} />
                  <Text style={sectionTitle}>Quick Actions</Text>
                </Box>
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: tokens.spacing[3] }}>
                  {quickActions.map((action, i) => (
                    <Box
                      key={action.key}
                      role="button"
                      tabIndex={0}
                      aria-label={`${action.label}: ${action.description}`}
                      onClick={() => onQuickAction?.(action.key)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onQuickAction?.(action.key); } }}
                      style={{
                        ...animStyle(i),
                        ...cardBase,
                        display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[3],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        transition: `all ${tokens.motion.hover}`,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = tokens.colors.primaryScale[300];
                        e.currentTarget.style.boxShadow = tokens.shadows.md;
                        e.currentTarget.style.transform = tokens.motion.transform;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = tokens.colors.neutral[200];
                        e.currentTarget.style.boxShadow = tokens.shadows.sm;
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <Text style={{
                        width: 36, height: 36, borderRadius: tokens.borderRadius.lg,
                        backgroundColor: tokens.colors.primaryScale[50],
                        color: tokens.colors.primaryScale[600],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {action.icon}
                      </Text>
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                        <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                          {action.label}
                        </Text>
                        <Text style={{ margin: 0, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], lineHeight: tokens.typography.lineHeight.relaxed }}>
                          {action.description}
                        </Text>
                      </Box>
                      <ChevronRight size={14} color={tokens.colors.neutral[400]} style={{ flexShrink: 0, marginTop: tokens.spacing[1], marginLeft: 'auto' }} />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

          </Box>
        </Box>
      </Box>
    );
  },
});
