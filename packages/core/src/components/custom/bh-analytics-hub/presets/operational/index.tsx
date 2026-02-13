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
const MOCK_FUNNEL: FunnelStage[] = [
  { name: 'Applied', count: 1240, conversionPercent: 100, prevPeriodCount: 1100 },
  { name: 'Screened', count: 620, conversionPercent: 50, prevPeriodCount: 550 },
  { name: 'Phone Screen', count: 410, conversionPercent: 66, prevPeriodCount: 380 },
  { name: 'Technical', count: 248, conversionPercent: 60, prevPeriodCount: 220 },
  { name: 'Onsite', count: 124, conversionPercent: 50, prevPeriodCount: 110 },
  { name: 'Offered', count: 62, conversionPercent: 50, prevPeriodCount: 55 },
  { name: 'Hired', count: 48, conversionPercent: 77, prevPeriodCount: 42 },
];

const MOCK_TTH: TimeToHireData[] = [
  { job: 'Sr. Frontend Engineer', avgDays: 28, stages: [{ name: 'Screen', avgDays: 3 }, { name: 'Technical', avgDays: 7 }, { name: 'Onsite', avgDays: 10 }, { name: 'Offer', avgDays: 5 }, { name: 'Close', avgDays: 3 }] },
  { job: 'Product Manager', avgDays: 34, stages: [{ name: 'Screen', avgDays: 4 }, { name: 'Interview', avgDays: 12 }, { name: 'Final', avgDays: 8 }, { name: 'Offer', avgDays: 6 }, { name: 'Close', avgDays: 4 }] },
  { job: 'DevOps Lead', avgDays: 22, stages: [{ name: 'Screen', avgDays: 2 }, { name: 'Technical', avgDays: 6 }, { name: 'Onsite', avgDays: 8 }, { name: 'Offer', avgDays: 4 }, { name: 'Close', avgDays: 2 }] },
  { job: 'Data Scientist', avgDays: 31, stages: [{ name: 'Screen', avgDays: 3 }, { name: 'Take-Home', avgDays: 9 }, { name: 'Onsite', avgDays: 10 }, { name: 'Offer', avgDays: 5 }, { name: 'Close', avgDays: 4 }] },
];

const MOCK_VELOCITY: PipelineVelocity[] = [
  { stage: 'Application Review', avgDays: 2.1, slaLimit: 3 },
  { stage: 'Phone Screen', avgDays: 3.4, slaLimit: 5 },
  { stage: 'Technical Interview', avgDays: 6.8, slaLimit: 7 },
  { stage: 'Onsite Panel', avgDays: 8.2, slaLimit: 10 },
  { stage: 'Offer Generation', avgDays: 4.1, slaLimit: 3 },
  { stage: 'Offer Close', avgDays: 3.5, slaLimit: 5 },
];

const MOCK_COST: CostAnalysis[] = [
  { category: 'Job Boards', costPerHire: 1200, breakdown: [{ item: 'LinkedIn', cost: 680 }, { item: 'Indeed', cost: 320 }, { item: 'Glassdoor', cost: 200 }] },
  { category: 'Agencies', costPerHire: 3400, breakdown: [{ item: 'TechRecruit Pro', cost: 2100 }, { item: 'Staffing Plus', cost: 1300 }] },
  { category: 'Referral Bonuses', costPerHire: 800, breakdown: [{ item: 'Employee referrals', cost: 800 }] },
  { category: 'Events', costPerHire: 600, breakdown: [{ item: 'Career fairs', cost: 350 }, { item: 'Meetups', cost: 250 }] },
];

const MOCK_SOURCES: SourceEffectiveness[] = [
  { source: 'LinkedIn', candidateCount: 420, qualityScore: 82 },
  { source: 'Referrals', candidateCount: 180, qualityScore: 91 },
  { source: 'Indeed', candidateCount: 310, qualityScore: 65 },
  { source: 'Career Site', candidateCount: 210, qualityScore: 74 },
  { source: 'Agencies', candidateCount: 120, qualityScore: 78 },
  { source: 'Events', candidateCount: 80, qualityScore: 70 },
];

/* ================================================================== */
/*  Operational Preset                                                 */
/* ================================================================== */
export const OperationalBhAnalyticsHub = createPreset<BhAnalyticsHubProps>({
  name: 'BhAnalyticsHub.Operational',
  render: (ctx: PresetContext<BhAnalyticsHubProps>) => {
    const { primitives: { Box, Flex, Stack, Text }, props, tokens: t } = ctx;

    const {
      funnelData = MOCK_FUNNEL,
      timeToHireData = MOCK_TTH,
      velocityData = MOCK_VELOCITY,
      costData = MOCK_COST,
      sourceData = MOCK_SOURCES,
      dateRange = '30d',
      onDateRangeChange,
      filters = {},
      onFilterChange,
      onExport,
      className,
      style,
    } = props;

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
              <Filter size={14} /> <Text style={{ fontSize: t.typography.fontSize.xs }}>Filters</Text> <ChevronDown size={12} />
            </Box>
            <Box onClick={() => onExport?.('csv')} style={{ display: 'inline-flex', alignItems: 'center', gap: t.spacing[1], padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white, fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], cursor: 'pointer' }}>
              <Download size={14} /> <Text style={{ fontSize: t.typography.fontSize.xs }}>Export</Text>
            </Box>
          </Box>
        </Flex>

        {/* ── Tab Navigation ── */}
        <Box style={{ display: 'flex', gap: t.spacing[1], marginBottom: t.spacing[6], padding: 3, borderRadius: t.borderRadius.lg, backgroundColor: t.colors.neutral[100] }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <Box key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.md, backgroundColor: isActive ? t.colors.common.white : 'transparent', color: isActive ? t.colors.neutral[900] : t.colors.neutral[500], fontSize: t.typography.fontSize.sm, fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium, cursor: 'pointer', transition: `all ${t.motion.hover}`, boxShadow: isActive ? t.shadows.sm : 'none', flex: 1, justifyContent: 'center' }}>
                <Icon size={16} />
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
                  const maxW = Math.max(...funnelData.map((s) => s.count), 1);
                  const pct = (stage.count / maxW) * 100;
                  const colors = [t.colors.primaryScale[500], t.colors.primaryScale[400], t.colors.infoScale[400], t.colors.infoScale[500], t.colors.warningScale[400], t.colors.successScale[400], t.colors.successScale[500]];
                  return (
                    <Box key={stage.name} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 50px 60px', alignItems: 'center', gap: t.spacing[2] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium, textAlign: 'right' as const }}>{stage.name}</Text>
                      <Box style={{ height: 24, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.sm, overflow: 'hidden', position: 'relative' as const }}>
                        <Box style={{ position: 'absolute' as const, left: 0, top: 0, height: '100%', width: `${pct}%`, backgroundColor: colors[i % colors.length], borderRadius: t.borderRadius.sm, transition: `width ${t.motion.hover}` }} />
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{stage.count.toLocaleString()}</Text>
                      {i > 0 && (
                        <Box style={{ ...createBadgeStyle(t, stage.conversionPercent >= 50 ? 'success' : stage.conversionPercent >= 30 ? 'warning' : 'error'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs }}>
                          {stage.conversionPercent}%
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
                  const dropped = stage.count - next.count;
                  const dropRate = Math.round((dropped / stage.count) * 100);
                  return (
                    <Box key={stage.name} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], padding: t.spacing[3], borderRadius: t.borderRadius.md, backgroundColor: dropRate > 50 ? t.colors.errorScale[50] : t.colors.neutral[50] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flex: 1 }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], fontWeight: t.typography.fontWeight.medium }}>{stage.name}</Text>
                        <ArrowRight size={14} color={t.colors.neutral[400]} />
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
                  const utilization = (v.avgDays / v.slaLimit) * 100;
                  const isOver = v.avgDays > v.slaLimit;
                  const barColor = isOver ? t.colors.errorScale[500] : utilization > 80 ? t.colors.warningScale[500] : t.colors.successScale[500];
                  return (
                    <Box key={v.stage}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>{v.stage}</Text>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: isOver ? t.colors.errorScale[700] : t.colors.neutral[900] }}>{v.avgDays}d</Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>/ {v.slaLimit}d SLA</Text>
                          {isOver && <AlertTriangle size={14} color={t.colors.errorScale[500]} />}
                          {!isOver && <CheckCircle2 size={14} color={t.colors.successScale[500]} />}
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
                    <Box onClick={() => setExpandedJob(expandedJob === job.job ? null : job.job)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${t.spacing[3]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.md, backgroundColor: t.colors.neutral[50], cursor: 'pointer', ...hoverStyles.base }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{job.job}</Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: job.avgDays > 30 ? t.colors.warningScale[700] : t.colors.neutral[900] }}>{job.avgDays}d</Text>
                        <ChevronDown size={14} color={t.colors.neutral[400]} style={{ transform: expandedJob === job.job ? 'rotate(180deg)' : 'none', transition: `transform ${t.motion.hover}` } as any} />
                      </Box>
                    </Box>
                    {expandedJob === job.job && (
                      <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[4]}px`, display: 'flex', flexDirection: 'column', gap: t.spacing[1] }}>
                        {job.stages.map((s) => (
                          <Box key={s.name} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{s.name}</Text>
                            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>{s.avgDays}d</Text>
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
                  const maxCost = Math.max(...costData.map((c) => c.costPerHire), 1);
                  return (
                    <Box key={cat.category}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{cat.category}</Text>
                        <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>${cat.costPerHire.toLocaleString()}</Text>
                      </Box>
                      <Box style={{ height: 12, backgroundColor: t.colors.neutral[100], borderRadius: t.borderRadius.sm, overflow: 'hidden' }}>
                        <Box style={{ height: '100%', width: `${(cat.costPerHire / maxCost) * 100}%`, backgroundColor: t.colors.primaryScale[400], borderRadius: t.borderRadius.sm, transition: `width ${t.motion.hover}` }} />
                      </Box>
                      <Box style={{ display: 'flex', gap: t.spacing[2], marginTop: t.spacing[2], flexWrap: 'wrap' as const }}>
                        {cat.breakdown.map((b) => (
                          <Box key={b.item} style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs }}>
                            {b.item}: ${b.cost}
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
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block', marginBottom: t.spacing[1] }}>{m.label}</Text>
                        <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{m.value}</Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <TIcon size={14} color={trendColor} />
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
                const effectiveness = Math.round((src.qualityScore * src.candidateCount) / 100);
                const maxEff = Math.max(...sourceData.map((s) => Math.round((s.qualityScore * s.candidateCount) / 100)), 1);
                return (
                  <Box key={src.source} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 120px', gap: t.spacing[3], padding: `${t.spacing[3]}px 0`, borderBottom: `1px solid ${t.colors.neutral[100]}`, alignItems: 'center' }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>{src.source}</Text>
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>{src.candidateCount}</Text>
                    <Box style={{ ...createBadgeStyle(t, src.qualityScore >= 80 ? 'success' : src.qualityScore >= 70 ? 'warning' : 'error'), borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs }}>{src.qualityScore}/100</Box>
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
