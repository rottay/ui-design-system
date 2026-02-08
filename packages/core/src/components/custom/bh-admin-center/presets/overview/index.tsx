'use client';

/**
 * BhAdminCenter - Overview Preset
 * Full admin dashboard: system health, providers, billing summary,
 * KPIs, users, events, cost breakdown, compliance, quick actions
 */

import { useState, useMemo} from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createStatusDotStyle,
  createSurfaceStyle,
} from '../../../helpers';
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
    const { Box } = primitives;
    const providerStatusColors = getProviderStatusColors(tokens);
    const circuitBreakerColors = getCircuitBreakerColors(tokens);
    const severityColors = getSeverityColors(tokens);
    const complianceColors = getComplianceColors(tokens);

    const {
      systemHealth,
      providers = [],
      billing,
      kpis = [],
      users,
      events = [],
      costBreakdown = [],
      compliance,
      quickActions = [],
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

    const isGlass = engine === 'modern' && tokens.surface.useGlass && !!tokens.glass;

    const [dateRange, setDateRange] = useState<DateRangeValue>('30d');
    const [providerFilter, setProviderFilter] = useState<string>('all');
    const [costView, setCostView] = useState<'bar' | 'treemap'>('bar');
    const [eventFilter, setEventFilter] = useState<string>('all');
    const [systemStatus, setSystemStatus] = useState<'live' | 'paused'>('live');

    const handleDateRange = (range: DateRangeValue) => {
      setDateRange(range);
      onDateRangeChange?.(range);
    };

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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
                <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], marginTop: 2 }}>
                  {formatPercentage(pct)}
                </span>
              </div>
            </foreignObject>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
              {typeof value === 'number' && typeof total === 'number' && total !== 100 ? `${value} / ${total}` : formatPercentage(pct)}
            </p>
            <p style={{ margin: 0, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{label}</p>
          </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
          {items.map((item) => {
            const widthPct = (item.value / max) * 100;
            return (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], width: 90, flexShrink: 0, textAlign: 'right' }}>{item.label}</span>
                <div style={{ flex: 1, position: 'relative', height: barHeight, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.sm, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${widthPct}%`,
                    backgroundColor: item.color,
                    borderRadius: tokens.borderRadius.sm,
                    transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                  }} />
                </div>
                <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800], width: 60, flexShrink: 0 }}>
                  {formatCurrency(item.value)}
                </span>
              </div>
            );
          })}
        </div>
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
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 2,
          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.full,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.medium,
          color, backgroundColor: bg,
        }}>
          <Icon size={12} />
          {isUp ? '+' : ''}{trend.toFixed(1)}%
        </span>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <div style={{
              width: 36, height: 36, borderRadius: tokens.borderRadius.lg,
              background: `linear-gradient(135deg, ${tokens.colors.primaryScale[500]}, ${tokens.colors.primaryScale[700]})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Settings size={18} color={tokens.colors.common.white} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{title}</h1>
              <p style={{ margin: 0, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>BitHire ATS Platform Administration</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {/* Date range pills */}
            <div style={{ display: 'flex', gap: tokens.spacing[1], padding: tokens.spacing[1], backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full }}>
              {DATE_RANGE_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => handleDateRange(opt.value as DateRangeValue)} style={pillBtn(dateRange === opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
            {/* Live / Paused toggle */}
            <button
              onClick={() => setSystemStatus(systemStatus === 'live' ? 'paused' : 'live')}
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
              <span style={{
                width: 6, height: 6, borderRadius: tokens.borderRadius.full,
                backgroundColor: systemStatus === 'live' ? tokens.colors.successScale[500] : tokens.colors.neutral[400],
              }} />
              {systemStatus === 'live' ? 'Live' : 'Paused'}
            </button>
            {/* Refresh */}
            <button onClick={onRefresh} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white, cursor: 'pointer',
              color: tokens.colors.neutral[600], transition: `all ${tokens.motion.hover}`,
            }}>
              <RefreshCw size={14} />
            </button>
            {/* Export */}
            <button onClick={onExportReport} style={{
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
              <FileText size={12} />
              Export
            </button>
          </div>
        </Box>

        {/* ── Scrollable body ─────────────────────────────────────── */}
        <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[5] }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5], maxWidth: 1400, margin: '0 auto', width: '100%' }}>

            {/* ── 1. System Health Hero ──────────────────────────── */}
            {systemHealth && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <Activity size={18} color={tokens.colors.primaryScale[600]} />
                  <h2 style={sectionTitle}>System Health</h2>
                </div>
                <div style={gridFour}>
                  {renderStatusCircleSvg(
                    systemHealth.providersUp,
                    systemHealth.providersTotal,
                    'Providers Up',
                    tokens.colors.successScale[500],
                    tokens.colors.successScale[100],
                    <Server size={16} color={tokens.colors.successScale[600]} />,
                  )}
                  {renderStatusCircleSvg(
                    systemHealth.interviewsRunning,
                    100,
                    'Interviews Running',
                    tokens.colors.infoScale[500],
                    tokens.colors.infoScale[100],
                    <Users size={16} color={tokens.colors.infoScale[600]} />,
                  )}
                  {renderStatusCircleSvg(
                    Math.min(systemHealth.tokenBalance, 100),
                    100,
                    `Token Balance: ${formatTokenBalance(systemHealth.tokenBalance)}`,
                    tokens.colors.primaryScale[500],
                    tokens.colors.primaryScale[100],
                    <Zap size={16} color={tokens.colors.primaryScale[600]} />,
                  )}
                  {renderStatusCircleSvg(
                    systemHealth.slaCompliance,
                    100,
                    'SLA Compliance',
                    systemHealth.slaCompliance >= 95 ? tokens.colors.successScale[500] : systemHealth.slaCompliance >= 80 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500],
                    systemHealth.slaCompliance >= 95 ? tokens.colors.successScale[100] : systemHealth.slaCompliance >= 80 ? tokens.colors.warningScale[100] : tokens.colors.errorScale[100],
                    <Shield size={16} color={systemHealth.slaCompliance >= 95 ? tokens.colors.successScale[600] : systemHealth.slaCompliance >= 80 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600]} />,
                  )}
                </div>
              </section>
            )}

            {/* ── 2. Provider Health Grid ────────────────────────── */}
            {providers.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Server size={18} color={tokens.colors.primaryScale[600]} />
                    <h2 style={sectionTitle}>Provider Health</h2>
                    <span style={{ ...createBadgeStyle(tokens, 'primary'), marginLeft: tokens.spacing[1] }}>{providers.length} providers</span>
                  </div>
                  <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                    {providerStatuses.map((s) => (
                      <button key={s} onClick={() => setProviderFilter(s)} style={pillBtn(providerFilter === s)}>
                        {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={gridThree}>
                  {filteredProviders.map((provider) => {
                    const sc = providerStatusColors[provider.status];
                    const cb = circuitBreakerColors[provider.circuitBreaker];
                    return (
                      <div
                        key={provider.id}
                        onClick={() => onProviderClick?.(provider.id)}
                        style={{
                          ...cardBase,
                          cursor: onProviderClick ? 'pointer' : 'default',
                          transition: `all ${tokens.motion.hover}`,
                          borderLeft: `3px solid ${sc.dot}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <span style={{
                              width: 8, height: 8, borderRadius: tokens.borderRadius.full,
                              backgroundColor: sc.dot,
                              display: 'inline-block',
                            }} />
                            <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                              {provider.name}
                            </span>
                          </div>
                          <span style={{
                            ...createBadgeStyle(tokens, provider.status === 'healthy' ? 'success' : provider.status === 'degraded' ? 'warning' : 'error'),
                          }}>
                            {provider.status}
                          </span>
                        </div>

                        {/* Latency bar */}
                        <div style={{ marginBottom: tokens.spacing[2] }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Latency</span>
                            <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{provider.latencyMs}ms</span>
                          </div>
                          {renderLatencyBar(provider.latencyMs)}
                        </div>

                        {/* Circuit breaker + last checked */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing[2] }}>
                          <span style={{
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.sm,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            backgroundColor: cb.bg, color: cb.color,
                          }}>
                            CB: {provider.circuitBreaker}
                          </span>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Clock size={10} />
                            {provider.lastChecked}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── 3. Billing Summary ─────────────────────────────── */}
            {billing && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <CreditCard size={18} color={tokens.colors.primaryScale[600]} />
                  <h2 style={sectionTitle}>Billing Summary</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: tokens.spacing[4] }}>
                  {/* Stats cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                    {/* Token balance */}
                    <div style={{ ...cardBase }}>
                      <p style={sectionSub}>Token Balance</p>
                      <p style={{ margin: 0, fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                        {formatTokenBalance(billing.tokenBalance)}
                      </p>
                    </div>
                    {/* Burn rate */}
                    <div style={{ ...cardBase }}>
                      <p style={sectionSub}>Burn Rate</p>
                      <p style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.warningScale[700] }}>
                        {formatTokenBalance(billing.burnRate)}<span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.normal, color: tokens.colors.neutral[500] }}>/day</span>
                      </p>
                    </div>
                    {/* Projected runway */}
                    <div style={{ ...cardBase }}>
                      <p style={sectionSub}>Projected Runway</p>
                      <p style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: billing.projectedRunwayDays < 14 ? tokens.colors.errorScale[600] : tokens.colors.successScale[600] }}>
                        {billing.projectedRunwayDays} <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.normal, color: tokens.colors.neutral[500] }}>days</span>
                      </p>
                    </div>
                    {/* Monthly cost */}
                    <div style={{ ...cardBase }}>
                      <p style={sectionSub}>Monthly Cost</p>
                      <p style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                        {formatCurrency(billing.monthlyCost)}
                      </p>
                    </div>
                  </div>

                  {/* Area chart */}
                  <div style={{ ...cardBase, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ ...sectionSub, marginBottom: tokens.spacing[3] }}>Monthly Token Trend</p>
                    <div style={{ flex: 1, minHeight: 200 }}>
                      {renderAreaChartSvg(
                        billing.monthlyTrend,
                        520,
                        200,
                        tokens.colors.primaryScale[500],
                        tokens.colors.primaryScale[400],
                        tokens.colors.primaryScale[100],
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── 4. Global Hiring Metrics ───────────────────────── */}
            {kpis.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <BarChart3 size={18} color={tokens.colors.primaryScale[600]} />
                  <h2 style={sectionTitle}>Global Hiring Metrics</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[4] }}>
                  {kpis.slice(0, 6).map((kpi, i) => (
                    <div key={i} style={{ ...cardBase }}>
                      <p style={{ ...sectionSub, marginBottom: tokens.spacing[1] }}>{kpi.label}</p>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <p style={{ margin: 0, fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                          {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                        </p>
                        {renderTrend(kpi.trend)}
                      </div>
                      <p style={{ margin: 0, marginTop: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        vs prev: {typeof kpi.previousValue === 'number' ? kpi.previousValue.toLocaleString() : kpi.previousValue}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── 5 & 6. Users + Events side by side ─────────────── */}
            <div style={gridTwo}>
              {/* 5. User Management Summary */}
              {users && (
                <section style={{ ...cardBase }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                    <UserCog size={18} color={tokens.colors.primaryScale[600]} />
                    <h3 style={sectionTitle}>User Management</h3>
                  </div>
                  <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
                    {/* Donut */}
                    <div>
                      {renderDonutChart(
                        Object.entries(users.byRole).map(([role, count], i) => ({
                          label: role,
                          value: count,
                          color: roleColors[i % roleColors.length],
                        })),
                        140,
                      )}
                    </div>
                    {/* Legend + stats */}
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: tokens.spacing[3] }}>
                        <p style={sectionSub}>Total Users</p>
                        <p style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                          {users.totalUsers.toLocaleString()}
                        </p>
                      </div>
                      <div style={{ marginBottom: tokens.spacing[3] }}>
                        <p style={sectionSub}>Recent Invitations</p>
                        <p style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.infoScale[600] }}>
                          {users.recentInvitations}
                        </p>
                      </div>
                      {/* Role legend */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                        {Object.entries(users.byRole).map(([role, count], i) => (
                          <div key={role} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <span style={{
                              width: 8, height: 8, borderRadius: tokens.borderRadius.full,
                              backgroundColor: roleColors[i % roleColors.length],
                              flexShrink: 0,
                            }} />
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], flex: 1 }}>{role}</span>
                            <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 6. Recent System Events */}
              <section style={{ ...cardBase, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <AlertTriangle size={18} color={tokens.colors.warningScale[600]} />
                    <h3 style={sectionTitle}>System Events</h3>
                    {events.length > 0 && (
                      <span style={{ ...createBadgeStyle(tokens, 'warning') }}>{events.length}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                    {eventTypes.map((t) => (
                      <button key={t} onClick={() => setEventFilter(t)} style={pillBtn(eventFilter === t)}>
                        {eventTypeLabels[t]}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                  {filteredEvents.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                      No events to display
                    </div>
                  ) : (
                    filteredEvents.map((evt) => {
                      const sc = severityColors[evt.severity];
                      return (
                        <div
                          key={evt.id}
                          onClick={() => onEventClick?.(evt.id)}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[3],
                            padding: tokens.spacing[3],
                            borderRadius: tokens.borderRadius.md,
                            backgroundColor: sc.bg,
                            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sc.border}`,
                            cursor: onEventClick ? 'pointer' : 'default',
                            transition: `all ${tokens.motion.hover}`,
                          }}
                        >
                          <span style={{ color: sc.color, flexShrink: 0, marginTop: 2 }}>
                            {eventIcons[evt.type] ?? <AlertTriangle size={14} />}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>
                              {evt.message}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[1] }}>
                              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{evt.time}</span>
                              <span style={{
                                padding: `0 ${tokens.spacing[2]}px`,
                                borderRadius: tokens.borderRadius.full,
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.medium,
                                backgroundColor: sc.bg, color: sc.color,
                                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sc.border}`,
                              }}>
                                {evt.severity}
                              </span>
                            </div>
                          </div>
                          <ChevronRight size={14} color={tokens.colors.neutral[400]} style={{ flexShrink: 0, marginTop: 2 }} />
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>

            {/* ── 7. Cost Breakdown ──────────────────────────────── */}
            {costBreakdown.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Layers size={18} color={tokens.colors.primaryScale[600]} />
                    <h2 style={sectionTitle}>Cost Breakdown</h2>
                  </div>
                  <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                    <button onClick={() => setCostView('bar')} style={pillBtn(costView === 'bar')}>Bar</button>
                    <button onClick={() => setCostView('treemap')} style={pillBtn(costView === 'treemap')}>Treemap</button>
                  </div>
                </div>
                <div style={{ ...cardBase }}>
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
                </div>
              </section>
            )}

            {/* ── 8. Compliance Dashboard ────────────────────────── */}
            {compliance && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <Lock size={18} color={tokens.colors.primaryScale[600]} />
                  <h2 style={sectionTitle}>Compliance Dashboard</h2>
                </div>
                <div style={gridThree}>
                  {/* Data Retention */}
                  <div style={{ ...cardBase, borderTop: `3px solid ${complianceColors[compliance.dataRetention].color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                      <Database size={16} color={complianceColors[compliance.dataRetention].color} />
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Data Retention</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={{
                        ...createBadgeStyle(tokens, compliance.dataRetention === 'ok' ? 'success' : compliance.dataRetention === 'warning' ? 'warning' : 'error'),
                      }}>
                        {compliance.dataRetention === 'ok' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        <span style={{ marginLeft: 4 }}>{compliance.dataRetention.toUpperCase()}</span>
                      </span>
                    </div>
                    <p style={{ margin: 0, marginTop: tokens.spacing[2], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      Retention policies are {compliance.dataRetention === 'ok' ? 'compliant' : 'requiring attention'}
                    </p>
                  </div>

                  {/* GDPR Requests */}
                  <div style={{ ...cardBase, borderTop: `3px solid ${tokens.colors.infoScale[500]}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                      <Globe size={16} color={tokens.colors.infoScale[600]} />
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>GDPR Requests</span>
                    </div>
                    <p style={{ margin: 0, fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                      {compliance.gdprRequests}
                    </p>
                    <p style={{ margin: 0, marginTop: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      Pending data subject requests
                    </p>
                  </div>

                  {/* Audit Completeness */}
                  <div style={{ ...cardBase, borderTop: `3px solid ${compliance.auditCompleteness >= 90 ? tokens.colors.successScale[500] : compliance.auditCompleteness >= 70 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500]}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                      <FileText size={16} color={compliance.auditCompleteness >= 90 ? tokens.colors.successScale[600] : compliance.auditCompleteness >= 70 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600]} />
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>Audit Completeness</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: tokens.spacing[2] }}>
                      <p style={{ margin: 0, fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                        {formatPercentage(compliance.auditCompleteness)}
                      </p>
                    </div>
                    <div style={{ marginTop: tokens.spacing[2] }}>
                      <svg width="100%" height="8" style={{ display: 'block' }}>
                        <rect x="0" y="0" width="100%" height="8" rx="4" fill={tokens.colors.neutral[100]} />
                        <rect
                          x="0" y="0"
                          width={`${compliance.auditCompleteness}%`}
                          height="8" rx="4"
                          fill={compliance.auditCompleteness >= 90 ? tokens.colors.successScale[500] : compliance.auditCompleteness >= 70 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500]}
                          style={{ transition: `width ${tokens.transitions?.normal || tokens.motion.hover}` }}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── 9. Quick Config Actions ────────────────────────── */}
            {quickActions.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
                  <Zap size={18} color={tokens.colors.primaryScale[600]} />
                  <h2 style={sectionTitle}>Quick Actions</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: tokens.spacing[3] }}>
                  {quickActions.map((action) => (
                    <button
                      key={action.key}
                      onClick={() => onQuickAction?.(action.key)}
                      style={{
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
                      <span style={{
                        width: 36, height: 36, borderRadius: tokens.borderRadius.lg,
                        backgroundColor: tokens.colors.primaryScale[50],
                        color: tokens.colors.primaryScale[600],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {action.icon}
                      </span>
                      <div>
                        <p style={{ margin: 0, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                          {action.label}
                        </p>
                        <p style={{ margin: 0, marginTop: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], lineHeight: tokens.typography.lineHeight.relaxed }}>
                          {action.description}
                        </p>
                      </div>
                      <ChevronRight size={14} color={tokens.colors.neutral[400]} style={{ flexShrink: 0, marginTop: 2, marginLeft: 'auto' }} />
                    </button>
                  ))}
                </div>
              </section>
            )}

          </div>
        </Box>
      </Box>
    );
  },
});
