'use client';

/**
 * BhAnalyticsHub - Operational Preset
 * Detailed operational analytics with granular filtering, funnel analysis,
 * pipeline velocity, cost breakdown, and time-to-hire deep dives.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Filter,
  Clock,
  DollarSign,
  GitBranch,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download,
  Layers,
  ArrowRight,
  Timer,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createIconContainerStyle,
  getPersonalityBadgeRadius,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  createEntranceAnimation,
  createStaggerDelay,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  createMetadataFieldStyle,
  createStatValueStyle,
  createStatLabelStyle,
  createTrendStyle,
  ICON_SIZES,
} from '../../../helpers';
import type { DesignTokens } from '../../../../../types';
import type {
  BhAnalyticsHubProps,
  FunnelStage,
  TimeToHireData,
  PipelineVelocity,
  CostAnalysis,
  SourceEffectiveness,
  DateRangePreset,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Operational Preset                                                 */
/* ================================================================== */
export const OperationalBhAnalyticsHub = createPreset<BhAnalyticsHubProps>({
  name: 'BhAnalyticsHub.Operational',
  render: (ctx: PresetContext<BhAnalyticsHubProps>) => {
    const { primitives: { Box, Flex, Stack, Text }, props, tokens: t } = ctx;

    const {
      funnelData: rawFunnelData = [],
      timeToHireData: rawTimeToHireData = [],
      velocityData: rawVelocityData = [],
      costData: rawCostData = [],
      sourceData: rawSourceData = [],
      dateRange = '30d',
      onDateRangeChange,
      filters = {},
      onFilterChange,
      onExport,
      className,
      style,
    } = props;

    const funnelData = Array.isArray(rawFunnelData) ? rawFunnelData : [];
    const timeToHireData = Array.isArray(rawTimeToHireData) ? rawTimeToHireData : [];
    const velocityData = Array.isArray(rawVelocityData) ? rawVelocityData : [];
    const costData = Array.isArray(rawCostData) ? rawCostData : [];
    const sourceData = Array.isArray(rawSourceData) ? rawSourceData : [];

    const [activeTab, setActiveTab] = useState<'funnel' | 'velocity' | 'cost' | 'sources'>('funnel');
    const [expandedJob, setExpandedJob] = useState<string | null>(null);

    const isGlass = t.surface.useGlass;
    const card = useMemo(() => createCardStyle(t, { padding: 28, glass: isGlass }), [t, isGlass]);
    const compactCard = useMemo(() => createCardStyle(t, { padding: 20, glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const handleTabChange = useCallback((tab: 'funnel' | 'velocity' | 'cost' | 'sources') => {
      setActiveTab(tab);
    }, []);

    const tabs = useMemo(() => [
      { key: 'funnel' as const, label: 'Funnel Analysis', icon: GitBranch },
      { key: 'velocity' as const, label: 'Pipeline Velocity', icon: Timer },
      { key: 'cost' as const, label: 'Cost Breakdown', icon: DollarSign },
      { key: 'sources' as const, label: 'Source Effectiveness', icon: Layers },
    ], []);

    const SectionTitle = ({ children }: { children: string }) => (
      <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight, color: t.colors.neutral[900], display: 'block', marginBottom: t.spacing[5], letterSpacing: ptypo.headingLetterSpacing }}>{children}</Text>
    );

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5], height: '100%', overflow: 'auto', backgroundColor: t.colors.neutral[50], padding: t.spacing[7], ...style }}>

        {/* ── Header ── */}
        <Flex align="center" justify="between" style={{ marginBottom: t.spacing[6] }}>
          <Stack gap={1}>
            <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>Operational Analytics</Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>Detailed recruiting metrics with drill-down capabilities</Text>
          </Stack>
          <Box style={{ display: 'flex', gap: t.spacing[2] }}>
            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], cursor: 'pointer' }}>
              <Filter size={ICON_SIZES.label} /> <Text style={{ fontSize: t.typography.fontSize.xs }}>Filters</Text> <ChevronDown size={ICON_SIZES.label} />
            </Box>
            <Box role="button" tabIndex={0} aria-label="Export CSV" onClick={() => onExport?.('csv')} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExport?.('csv'); } }} style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], cursor: 'pointer' }}>
              <Download size={ICON_SIZES.label} /> <Text style={{ fontSize: t.typography.fontSize.xs }}>Export</Text>
            </Box>
          </Box>
        </Flex>

        {/* ── Tab Navigation ── */}
        <Box style={{ display: 'flex', gap: t.spacing[1], marginBottom: t.spacing[6], padding: t.spacing[1], borderRadius: t.borderRadius.lg, backgroundColor: t.colors.neutral[100] }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <Box key={tab.key} role="tab" tabIndex={0} aria-selected={isActive} onClick={() => setActiveTab(tab.key)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTab(tab.key); } }} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, backgroundColor: isActive ? t.colors.common.white : 'transparent', color: isActive ? t.colors.neutral[900] : t.colors.neutral[500], fontSize: t.typography.fontSize.sm, fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium, cursor: 'pointer', transition: `all ${t.motion.hover}`, boxShadow: isActive ? t.shadows.sm : 'none', flex: 1, justifyContent: 'center' }}>
                <Icon size={ICON_SIZES.section} />
                <Text style={{ fontSize: t.typography.fontSize.sm }}>{tab.label}</Text>
              </Box>
            );
          })}
        </Box>

        {/* ── Funnel Analysis Tab ── */}
        {activeTab === 'funnel' && (
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[6] }}>
            <Box style={card}>
              <SectionTitle>Conversion Funnel</SectionTitle>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                {funnelData.map((stage, i) => {
                  const maxW = Math.max(...funnelData.map((s) => s.count ?? 0), 1);
                  const pct = ((stage.count ?? 0) / maxW) * 100;
                  const colors = [t.colors.primaryScale[500], t.colors.primaryScale[400], t.colors.infoScale[400], t.colors.infoScale[500], t.colors.warningScale[400], t.colors.successScale[400], t.colors.successScale[500]];
                  return (
                    <Box key={stage.name} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 50px 60px', alignItems: 'center', gap: t.spacing[2] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium, textAlign: 'right' as const }}>{stage.name}</Text>
                      <Box style={{ height: 24, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.sm, overflow: 'hidden', position: 'relative' as const }}>
                        <Box style={{ position: 'absolute' as const, left: 0, top: 0, height: '100%', width: `${pct}%`, backgroundColor: colors[i % colors.length], borderRadius: t.borderRadius.sm, transition: `width ${t.motion.hover}` }} />
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{(stage.count ?? 0).toLocaleString()}</Text>
                      {i > 0 && (
                        <Box style={{ ...createBadgeStyle(t, (stage.conversionPercent ?? 0) >= 50 ? 'success' : (stage.conversionPercent ?? 0) >= 30 ? 'warning' : 'error'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs }}>
                          {stage.conversionPercent ?? 0}%
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Drop-off Analysis */}
            <Box style={card}>
              <SectionTitle>Stage Drop-off</SectionTitle>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
                {funnelData.slice(0, -1).map((stage, i) => {
                  const next = funnelData[i + 1];
                  const dropped = (stage.count ?? 0) - (next.count ?? 0);
                  const dropRate = (stage.count ?? 0) > 0 ? Math.round((dropped / (stage.count ?? 1)) * 100) : 0;
                  return (
                    <Box key={stage.name} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], padding: t.spacing[3], borderRadius: t.borderRadius.md, backgroundColor: dropRate > 50 ? t.colors.errorScale[50] : t.colors.neutral[50] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flex: 1 }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], fontWeight: t.typography.fontWeight.medium }}>{stage.name}</Text>
                        <ArrowRight size={ICON_SIZES.label} color={t.colors.neutral[400]} />
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], fontWeight: t.typography.fontWeight.medium }}>{next.name}</Text>
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: dropRate > 50 ? t.colors.errorScale[700] : t.colors.neutral[900] }}>
                        -{dropped} ({dropRate}%)
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Pipeline Velocity Tab ── */}
        {activeTab === 'velocity' && (
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[6] }}>
            <Box style={card}>
              <SectionTitle>Stage Velocity vs SLA</SectionTitle>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
                {velocityData.map((v) => {
                  const utilization = ((v.avgDays ?? 0) / Math.max(v.slaLimit ?? 1, 1)) * 100;
                  const isOver = (v.avgDays ?? 0) > (v.slaLimit ?? 0);
                  const barColor = isOver ? t.colors.errorScale[500] : utilization > 80 ? t.colors.warningScale[500] : t.colors.successScale[500];
                  return (
                    <Box key={v.stage}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>{v.stage}</Text>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: isOver ? t.colors.errorScale[700] : t.colors.neutral[900] }}>{v.avgDays ?? 0}d</Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>/ {v.slaLimit ?? 0}d SLA</Text>
                          {isOver && <AlertTriangle size={ICON_SIZES.label} color={t.colors.errorScale[500]} />}
                          {!isOver && <CheckCircle2 size={ICON_SIZES.label} color={t.colors.successScale[500]} />}
                        </Box>
                      </Box>
                      <Box style={{ height: 8, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.full, overflow: 'hidden', position: 'relative' as const }}>
                        <Box style={{ position: 'absolute' as const, left: `${Math.min(utilization, 100)}%`, top: -2, width: 2, height: 12, backgroundColor: t.colors.neutral[400] }} />
                        <Box style={{ height: '100%', width: `${Math.min(utilization, 100)}%`, backgroundColor: barColor, borderRadius: t.borderRadius.full, transition: `width ${t.motion.hover}` }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box style={card}>
              <SectionTitle>Time to Hire by Role</SectionTitle>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                {timeToHireData.map((job) => (
                  <Box key={job.job}>
                    <Box role="button" tabIndex={0} aria-expanded={expandedJob === (job.job ?? '')} aria-label={`${job.job}: ${job.avgDays ?? 0} days average`} onClick={() => setExpandedJob(expandedJob === (job.job ?? '') ? null : (job.job ?? ''))} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedJob(expandedJob === (job.job ?? '') ? null : (job.job ?? '')); } }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.spacing[3]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: t.colors.neutral[50], cursor: 'pointer', ...hoverStyles.base }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{job.job}</Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{ ...createStatValueStyle(t, { size: 'lg' }), color: (job.avgDays ?? 0) > 30 ? t.colors.warningScale[700] : t.colors.neutral[900] }}>{job.avgDays ?? 0}d</Text>
                        <ChevronDown size={ICON_SIZES.label} color={t.colors.neutral[400]} style={{ transform: expandedJob === job.job ? 'rotate(180deg)' : 'none', transition: `transform ${t.motion.hover}` } as React.CSSProperties} />
                      </Box>
                    </Box>
                    {expandedJob === job.job && (
                      <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[4]}px`, display: 'flex', flexDirection: 'column', gap: t.spacing[1] }}>
                        {(job.stages ?? []).map((s) => (
                          <Box key={s.name ?? ''} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{s.name ?? ''}</Text>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>{s.avgDays ?? 0}d</Text>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Cost Breakdown Tab ── */}
        {activeTab === 'cost' && (
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: t.spacing[6] }}>
            <Box style={card}>
              <SectionTitle>Cost per Hire by Category</SectionTitle>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[4] }}>
                {costData.map((cat) => {
                  const maxCost = Math.max(...costData.map((c) => c.costPerHire ?? 0), 1);
                  return (
                    <Box key={cat.category}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{cat.category}</Text>
                        <Text style={createStatValueStyle(t, { size: 'lg' })}>${(cat.costPerHire ?? 0).toLocaleString()}</Text>
                      </Box>
                      <Box style={{ height: 12, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.sm, overflow: 'hidden' }}>
                        <Box style={{ height: '100%', width: `${((cat.costPerHire ?? 0) / maxCost) * 100}%`, backgroundColor: t.colors.primaryScale[400], borderRadius: t.borderRadius.sm, transition: `width ${t.motion.hover}` }} />
                      </Box>
                      <Box style={{ display: 'flex', gap: t.spacing[2], marginTop: t.spacing[2], flexWrap: 'wrap' as const }}>
                        {(cat.breakdown ?? []).map((b) => (
                          <Box key={b.item ?? ''} style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs }}>
                            {b.item ?? ''}: ${b.cost ?? 0}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
            <Box style={card}>
              <SectionTitle>Cost Efficiency Summary</SectionTitle>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[4] }}>
                {[
                  { label: 'Total Recruiting Spend', value: '$205,440', trend: -5 },
                  { label: 'Average Cost per Hire', value: '$4,280', trend: -12 },
                  { label: 'Cost per Qualified Candidate', value: '$166', trend: 3 },
                  { label: 'Agency vs Direct Ratio', value: '28:72', trend: -8 },
                ].map((m) => {
                  const trendColor = m.trend > 0 ? t.colors.errorScale[600] : t.colors.successScale[600];
                  const TIcon = m.trend > 0 ? TrendingUp : TrendingDown;
                  return (
                    <Box key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: t.spacing[4], borderRadius: t.borderRadius.md, backgroundColor: t.colors.neutral[50] }}>
                      <Box style={createMetadataFieldStyle(t)}>
                        <Text style={{ ...createStatLabelStyle(t), marginBottom: t.spacing[1] }}>{m.label}</Text>
                        <Text style={createStatValueStyle(t)}>{m.value}</Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <TIcon size={ICON_SIZES.label} color={trendColor} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: trendColor }}>{Math.abs(m.trend)}%</Text>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Sources Tab ── */}
        {activeTab === 'sources' && (
          <Box style={card}>
            <SectionTitle>Source Channel Comparison</SectionTitle>
            <Box style={{ display: 'flex', flexDirection: 'column' }}>
              <Box style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 120px', gap: t.spacing[3], padding: `${t.spacing[2]}px 0`, borderBottom: `1px solid ${t.colors.neutral[200]}` }}>
                {['Source', 'Candidates', 'Quality', 'Effectiveness'].map((h) => (
                  <Text key={h} style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{h}</Text>
                ))}
              </Box>
              {sourceData.map((src) => {
                const effectiveness = Math.round(((src.qualityScore ?? 0) * (src.candidateCount ?? 0)) / 100);
                const maxEff = Math.max(...sourceData.map((s) => Math.round(((s.qualityScore ?? 0) * (s.candidateCount ?? 0)) / 100)), 1);
                return (
                  <Box key={src.source} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 120px', gap: t.spacing[3], padding: `${t.spacing[3]}px 0`, borderBottom: `1px solid ${t.colors.neutral[100]}`, alignItems: 'center' }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{src.source}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{src.candidateCount ?? 0}</Text>
                    <Box style={{ ...createBadgeStyle(t, (src.qualityScore ?? 0) >= 80 ? 'success' : (src.qualityScore ?? 0) >= 70 ? 'warning' : 'error'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs }}>{src.qualityScore ?? 0}/100</Box>
                    <Box style={{ height: 8, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.full, overflow: 'hidden' }}>
                      <Box style={{ height: '100%', width: `${(effectiveness / maxEff) * 100}%`, backgroundColor: t.colors.primaryScale[400], borderRadius: t.borderRadius.full }} />
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
