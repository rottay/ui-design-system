'use client';

/**
 * BhAnalyticsHub - Executive Preset
 * High-level executive analytics dashboard with KPIs, hiring funnel,
 * trend chart, recruiter leaderboard, and source effectiveness.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  DollarSign,
  Clock,
  Target,
  Download,
  Calendar,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createIconContainerStyle,
  getPersonalityBadgeRadius,
  createEntranceAnimation,
  createStaggerDelay,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  createStatValueStyle,
  createStatLabelStyle,
  createTrendStyle,
  ICON_SIZES,
} from '../../../helpers';
import type { DesignTokens } from '../../../../../types';
import type {
  BhAnalyticsHubProps,
  FunnelStage,
  RecruiterPerformance,
  SourceEffectiveness,
  DateRangePreset,
  TrendComparison,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function sparkPoints(data: number[], w: number, h: number, pad: number = 2): string {
  if (!data.length) return '';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1 || 1);
  return data.map((v, i) => `${pad + i * step},${h - pad - ((v - min) / range) * (h - pad * 2)}`).join(' ');
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const DATE_RANGES: { value: DateRangePreset; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'year', label: '12 months' },
];

/* ================================================================== */
/*  Executive Preset                                                   */
/* ================================================================== */
export const ExecutiveBhAnalyticsHub = createPreset<BhAnalyticsHubProps>({
  name: 'BhAnalyticsHub.Executive',
  render: (ctx: PresetContext<BhAnalyticsHubProps>) => {
    const { primitives: { Box, Flex, Stack, Text }, props, tokens: t } = ctx;

    const {
      dateRange = '30d',
      onDateRangeChange,
      funnelData: rawFunnelData = [],
      recruiterData: rawRecruiterData = [],
      sourceData: rawSourceData = [],
      trendData: rawTrendData = [],
      comparisonPeriod = true,
      onComparisonToggle,
      onExport,
      onMetricSelect,
      diversityData: rawDiversityData = [],
      selectedMetric: selectedMetricProp,
      drilldownEntity: drilldownEntityProp,
      exportFormat: exportFormatProp,
      className,
      style,
    } = props;

    const funnelData = Array.isArray(rawFunnelData) ? rawFunnelData : [];
    const recruiterData = Array.isArray(rawRecruiterData) ? rawRecruiterData : [];
    const sourceData = Array.isArray(rawSourceData) ? rawSourceData : [];
    const trendData = Array.isArray(rawTrendData) ? rawTrendData : [];
    const diversityData = Array.isArray(rawDiversityData) ? rawDiversityData : [];

    const [activeDateRange, setActiveDateRange] = useState<DateRangePreset>(dateRange);
    const [selectedKpi, setSelectedKpi] = useState<string | null>(selectedMetricProp ?? null);

    const isGlass = t.surface.useGlass;
    const card = useMemo(() => createCardStyle(t, { padding: 28, glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const handleDateRange = useCallback((range: DateRangePreset) => {
      setActiveDateRange(range);
      onDateRangeChange?.(range);
    }, [onDateRangeChange]);

    const totalHires = funnelData.find((f) => f.name === 'Hired')?.count ?? 48;
    const prevHires = funnelData.find((f) => f.name === 'Hired')?.prevPeriodCount ?? 42;
    const hiresTrend = prevHires > 0 ? Math.round(((totalHires - prevHires) / prevHires) * 100) : 0;

    const kpis = [
      { label: 'Total Hires', value: String(totalHires), trend: hiresTrend, icon: Users, color: t.colors.primaryScale },
      { label: 'Avg Time to Hire', value: '21d', trend: -8, icon: Clock, color: t.colors.infoScale },
      { label: 'Cost per Hire', value: '$4,280', trend: -12, icon: DollarSign, color: t.colors.successScale },
      { label: 'Pipeline Velocity', value: '3.2x', trend: 15, icon: Zap, color: t.colors.warningScale },
      { label: 'Offer Accept Rate', value: '77%', trend: 5, icon: Target, color: t.colors.secondaryScale },
    ];

    const SectionTitle = ({ children, action }: { children: string; action?: React.ReactNode }) => (
      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[5] }}>
        <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>{children}</Text>
        {action}
      </Box>
    );

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5], height: '100%', overflow: 'auto', backgroundColor: t.colors.neutral[50], padding: t.spacing[7], ...style }}>

        {/* ── Header ── */}
        <Flex align="center" justify="between" style={{ marginBottom: t.spacing[7] }}>
          <Stack gap={1}>
            <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
              Hiring Analytics
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
              Executive overview of recruiting performance and pipeline health
            </Text>
          </Stack>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={{ display: 'flex', gap: t.spacing[1], padding: t.spacing[1], borderRadius: t.borderRadius.md, backgroundColor: t.colors.neutral[100] }}>
              {DATE_RANGES.map((r) => (
                <Box key={r.value} role="tab" tabIndex={0} aria-selected={activeDateRange === r.value} onClick={() => handleDateRange(r.value)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDateRange(r.value); } }} style={{ padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.sm, backgroundColor: activeDateRange === r.value ? t.colors.common.white : 'transparent', color: activeDateRange === r.value ? t.colors.neutral[900] : t.colors.neutral[500], fontSize: t.typography.fontSize.xs, fontWeight: activeDateRange === r.value ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium, cursor: 'pointer', transition: `all ${t.motion.hover}`, boxShadow: activeDateRange === r.value ? t.shadows.sm : 'none' }}>
                  {r.label}
                </Box>
              ))}
            </Box>
            <Box role="button" tabIndex={0} onClick={() => onExport?.('pdf')} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExport?.('pdf'); } }} style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], cursor: 'pointer', ...hoverStyles.base }}>
              <Download size={ICON_SIZES.label} />
              <Text style={{ fontSize: t.typography.fontSize.xs }}>Export</Text>
            </Box>
          </Box>
        </Flex>

        {/* ── KPI Cards ── */}
        <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: t.spacing[4], marginBottom: t.spacing[7] }}>
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const isPositive = kpi.trend > 0;
            const isNeutral = kpi.trend === 0;
            const invertedMetric = kpi.label.includes('Cost') || kpi.label.includes('Time');
            const trendColor = isNeutral ? t.colors.neutral[500] : invertedMetric ? (isPositive ? t.colors.errorScale[600] : t.colors.successScale[600]) : (isPositive ? t.colors.successScale[600] : t.colors.errorScale[600]);
            const TrendIcon = isPositive ? ArrowUpRight : isNeutral ? Minus : ArrowDownRight;

            return (
              <Box key={kpi.label} role="button" tabIndex={0} aria-label={`${kpi.label}: ${kpi.value}`} onClick={() => { setSelectedKpi(kpi.label); onMetricSelect?.(kpi.label); }} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedKpi(kpi.label); onMetricSelect?.(kpi.label); } }} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], ...card, cursor: 'pointer', ...hoverStyles.base, border: selectedKpi === kpi.label ? `2px solid ${t.colors.primaryScale[300]}` : card.border }} onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => Object.assign(e.currentTarget.style, hoverStyles.hover)} onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = card.boxShadow || 'none'; }}>
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                  <Box style={createIconContainerStyle(t, { size: 40, color: kpi.color[50] })}>
                    <Icon size={ICON_SIZES.feature} color={kpi.color[600]} />
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendIcon size={ICON_SIZES.label} color={trendColor} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: trendColor }}>{Math.abs(kpi.trend)}%</Text>
                  </Box>
                </Box>
                <Text style={createStatValueStyle(t, { size: '2xl' })}>{kpi.value}</Text>
                <Text style={createStatLabelStyle(t)}>{kpi.label}</Text>
              </Box>
            );
          })}
        </Box>

        {/* ── Two-Column: Funnel + Trend ── */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[6], marginBottom: t.spacing[6] }}>

          {/* Hiring Funnel */}
          <Box style={card}>
            <SectionTitle>Hiring Funnel</SectionTitle>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
              {funnelData.map((stage, i) => {
                const maxCount = Math.max(...funnelData.map((s) => s.count ?? 0), 1);
                const pct = ((stage.count ?? 0) / maxCount) * 100;
                const prevPct = stage.prevPeriodCount ? (stage.prevPeriodCount / maxCount) * 100 : 0;
                const colors = [t.colors.primaryScale[500], t.colors.primaryScale[400], t.colors.infoScale[500], t.colors.warningScale[500], t.colors.successScale[500]];
                return (
                  <Box key={stage.name}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>{stage.name}</Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{(stage.count ?? 0).toLocaleString()}</Text>
                        {i > 0 && <Box style={{ ...createBadgeStyle(t, (stage.conversionPercent ?? 0) >= 40 ? 'success' : (stage.conversionPercent ?? 0) >= 20 ? 'warning' : 'error'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs }}>{stage.conversionPercent ?? 0}%</Box>}
                      </Box>
                    </Box>
                    <Box style={{ position: 'relative' as const, height: 20, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.sm, overflow: 'hidden' }}>
                      {comparisonPeriod && stage.prevPeriodCount && <Box style={{ position: 'absolute' as const, left: 0, top: 0, height: '100%', width: `${prevPct}%`, backgroundColor: t.colors.neutral[200], borderRadius: t.borderRadius.sm, opacity: 0.5 }} />}
                      <Box style={{ position: 'absolute' as const, left: 0, top: 0, height: '100%', width: `${pct}%`, backgroundColor: colors[i % colors.length], borderRadius: t.borderRadius.sm, transition: `width ${t.motion.hover}` }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Trend Chart */}
          <Box style={card}>
            <SectionTitle action={
              <Box role="button" tabIndex={0} aria-pressed={!!comparisonPeriod} onClick={() => onComparisonToggle?.(!comparisonPeriod)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onComparisonToggle?.(!comparisonPeriod); } }} style={{ ...createBadgeStyle(t, comparisonPeriod ? 'primary' : 'info'), borderRadius: badgeRadius, cursor: 'pointer', fontSize: t.typography.fontSize.xs }}>
                {comparisonPeriod ? 'Comparison On' : 'Comparison Off'}
              </Box>
            }>Hiring Trend</SectionTitle>
            {trendData.length > 0 && (() => {
              const cW = 480; const cH = 200; const pad = 32;
              const allVals = trendData.flatMap((d) => comparisonPeriod ? [d.current ?? 0, d.previous ?? 0] : [d.current ?? 0]);
              const maxV = Math.max(...allVals, 1); const minV = Math.min(...allVals, 0); const range = maxV - minV || 1;
              const stepX = (cW - pad * 2) / (trendData.length - 1 || 1);
              const toP = (v: number, i: number) => ({ x: pad + i * stepX, y: cH - pad - ((v - minV) / range) * (cH - pad * 2) });
              const cur = trendData.map((d, i) => toP(d.current ?? 0, i));
              const prev = trendData.map((d, i) => toP(d.previous ?? 0, i));

              return (
                <svg width="100%" viewBox={`0 0 ${cW} ${cH}`} style={{ display: 'block' }}>
                  {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                    const y = cH - pad - p * (cH - pad * 2);
                    return <g key={p}><line x1={pad} y1={y} x2={cW - pad} y2={y} stroke={t.colors.neutral[100]} /><text x={pad - 8} y={y + 4} textAnchor="end" fill={t.colors.neutral[400]} fontSize="10">{Math.round(minV + p * range)}</text></g>;
                  })}
                  {trendData.map((d, i) => <text key={i} x={pad + i * stepX} y={cH - 8} textAnchor="middle" fill={t.colors.neutral[400]} fontSize="10">{d.date ?? ''}</text>)}
                  {comparisonPeriod && <polyline points={prev.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={t.colors.neutral[300]} strokeWidth="2" strokeDasharray="4 4" />}
                  <defs><linearGradient id="exec-trend-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={t.colors.primaryScale[500]} stopOpacity="0.15" /><stop offset="100%" stopColor={t.colors.primaryScale[500]} stopOpacity="0" /></linearGradient></defs>
                  <polygon points={`${cur[0].x},${cH - pad} ${cur.map((p) => `${p.x},${p.y}`).join(' ')} ${cur[cur.length - 1].x},${cH - pad}`} fill="url(#exec-trend-g)" />
                  <polyline points={cur.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={t.colors.primaryScale[500]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {cur.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={t.colors.common.white} stroke={t.colors.primaryScale[500]} strokeWidth="2" />)}
                </svg>
              );
            })()}
          </Box>
        </Box>

        {/* ── Recruiter Leaderboard + Source Effectiveness ── */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: t.spacing[6] }}>

          {/* Leaderboard */}
          <Box style={card}>
            <SectionTitle action={<Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Award size={ICON_SIZES.label} /> Top Performers</Box>}>
              Recruiter Leaderboard
            </SectionTitle>
            <Box style={{ display: 'flex', flexDirection: 'column' }}>
              <Box style={{ display: 'grid', gridTemplateColumns: '40px 1fr 70px 70px 90px 70px 56px', gap: t.spacing[2], padding: `${t.spacing[2]}px 0`, borderBottom: `1px solid ${t.colors.neutral[200]}` }}>
                {['#', 'Recruiter', 'Hires', 'Velocity', 'Pipeline', 'CSAT', 'Trend'].map((h) => (
                  <Text key={h} style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{h}</Text>
                ))}
              </Box>
              {recruiterData.map((rec, i) => (
                <Box key={rec.name} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 70px 70px 90px 70px 56px', gap: t.spacing[2], padding: `${t.spacing[3]}px 0`, borderBottom: `1px solid ${t.colors.neutral[100]}`, alignItems: 'center' }}>
                  <Box style={{ width: 24, height: 24, borderRadius: t.borderRadius.full, backgroundColor: i === 0 ? t.colors.warningScale[100] : t.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: i === 0 ? t.colors.warningScale[700] : t.colors.neutral[600] }}>{i + 1}</Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{ width: 32, height: 32, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.colors.primaryScale[700], fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold }}>{(rec.name || '').charAt(0)}</Box>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900] }}>{rec.name}</Text>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{rec.hires ?? 0}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{rec.velocity ?? 0}d</Text>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>${((rec.pipelineValue ?? 0) / 1000).toFixed(0)}k</Text>
                  <Box style={{ ...createBadgeStyle(t, (rec.satisfaction ?? 0) >= 90 ? 'success' : (rec.satisfaction ?? 0) >= 85 ? 'warning' : 'error'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs }}>{rec.satisfaction ?? 0}%</Box>
                  <svg width={48} height={20} viewBox="0 0 48 20"><polyline points={sparkPoints(rec.sparkline ?? [], 48, 20)} fill="none" stroke={t.colors.successScale[400]} strokeWidth="1.5" strokeLinecap="round" /></svg>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Drilldown & Export indicators */}
          {(drilldownEntityProp || exportFormatProp) && (
            <Box style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              {drilldownEntityProp && (
                <Box style={{ ...createBadgeStyle(t, 'primary'), borderRadius: badgeRadius, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <BarChart3 size={ICON_SIZES.label} />
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>Drilldown: {drilldownEntityProp}</Text>
                </Box>
              )}
              {exportFormatProp && (
                <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeRadius, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Download size={ICON_SIZES.label} />
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>Export: {exportFormatProp.toUpperCase()}</Text>
                </Box>
              )}
            </Box>
          )}

          {/* Source Quality */}
          <Box style={card}>
            <SectionTitle>Source Quality</SectionTitle>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[4] }}>
              {sourceData.map((src) => {
                const maxC = Math.max(...sourceData.map((s) => s.candidateCount ?? 0), 1);
                const qColor = (src.qualityScore ?? 0) >= 80 ? t.colors.successScale : (src.qualityScore ?? 0) >= 70 ? t.colors.warningScale : t.colors.errorScale;
                return (
                  <Box key={src.source}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{src.source}</Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{src.candidateCount ?? 0}</Text>
                        <Box style={{ ...createBadgeStyle(t, (src.qualityScore ?? 0) >= 80 ? 'success' : (src.qualityScore ?? 0) >= 70 ? 'warning' : 'error'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs }}>Q:{src.qualityScore ?? 0}</Box>
                      </Box>
                    </Box>
                    <Box style={{ height: 8, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.full, overflow: 'hidden' }}>
                      <Box style={{ height: '100%', width: `${((src.candidateCount ?? 0) / maxC) * 100}%`, backgroundColor: qColor[400], borderRadius: t.borderRadius.full, transition: `width ${t.motion.hover}` }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
        {/* Diversity Data */}
        {diversityData.length > 0 && (
          <Box style={{ ...card, marginTop: t.spacing[6] }}>
            <SectionTitle action={<Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Users size={ICON_SIZES.label} /> Diversity</Box>}>Diversity Breakdown</SectionTitle>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
              {diversityData.map((item) => {
                const pct = item.total > 0 ? (item.value / item.total) * 100 : 0;
                const barColor = pct >= 40 ? t.colors.successScale[400] : pct >= 25 ? t.colors.warningScale[400] : t.colors.errorScale[400];
                return (
                  <Box key={item.category}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>{item.category}</Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{item.value}</Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>/ {item.total}</Text>
                        <Box style={{ ...createBadgeStyle(t, pct >= 40 ? 'success' : pct >= 25 ? 'warning' : 'error'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs }}>{pct.toFixed(1)}%</Box>
                      </Box>
                    </Box>
                    <Box style={{ height: 8, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.full, overflow: 'hidden' }}>
                      <Box style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: t.borderRadius.full, transition: `width ${t.motion.hover}` }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
