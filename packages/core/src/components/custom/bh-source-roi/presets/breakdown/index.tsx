'use client';

/**
 * BhSourceRoi - Breakdown Preset
 * Detailed tabular view with all metrics per source, trend sparklines,
 * cost analysis, and per-source drill-down panels.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  BarChart3,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Award,
  Zap,
  Globe,
  UserPlus,
  Briefcase,
  Share2,
  CalendarDays,
  Megaphone,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createProgressBarStyle,
  createEntranceAnimation,
  createStaggerDelay,
} from '../../../helpers';
import type {
  BhSourceRoiProps,
  SourceChannel,
  SourceTrend,
  SourceRoiSummary,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const MOCK_SOURCES: SourceChannel[] = [
  { id: 's1', name: 'LinkedIn Recruiter', type: 'linkedin', candidateCount: 482, hireCount: 38, hireRate: 7.9, totalCost: 48600, costPerHire: 1279, costPerCandidate: 101, avgTimeToHireDays: 32, qualityScore: 82, retentionRate90d: 91 },
  { id: 's2', name: 'Employee Referrals', type: 'referral', candidateCount: 214, hireCount: 42, hireRate: 19.6, totalCost: 21000, costPerHire: 500, costPerCandidate: 98, avgTimeToHireDays: 24, qualityScore: 88, retentionRate90d: 94 },
  { id: 's3', name: 'Indeed', type: 'job_board', candidateCount: 1240, hireCount: 56, hireRate: 4.5, totalCost: 36800, costPerHire: 657, costPerCandidate: 30, avgTimeToHireDays: 41, qualityScore: 68, retentionRate90d: 82 },
  { id: 's4', name: 'Robert Half Agency', type: 'agency', candidateCount: 86, hireCount: 18, hireRate: 20.9, totalCost: 94500, costPerHire: 5250, costPerCandidate: 1099, avgTimeToHireDays: 28, qualityScore: 79, retentionRate90d: 87 },
  { id: 's5', name: 'Careers Page', type: 'career_site', candidateCount: 892, hireCount: 34, hireRate: 3.8, totalCost: 4200, costPerHire: 124, costPerCandidate: 5, avgTimeToHireDays: 38, qualityScore: 71, retentionRate90d: 85 },
  { id: 's6', name: 'Twitter/X Campaigns', type: 'social', candidateCount: 156, hireCount: 8, hireRate: 5.1, totalCost: 12400, costPerHire: 1550, costPerCandidate: 79, avgTimeToHireDays: 44, qualityScore: 64, retentionRate90d: 78 },
  { id: 's7', name: 'Tech Meetup Events', type: 'event', candidateCount: 68, hireCount: 12, hireRate: 17.6, totalCost: 18000, costPerHire: 1500, costPerCandidate: 265, avgTimeToHireDays: 26, qualityScore: 85, retentionRate90d: 92 },
];

const MOCK_TRENDS: SourceTrend[] = [
  { month: 'Sep', sourceId: 's1', hires: 6, cost: 7200 },
  { month: 'Oct', sourceId: 's1', hires: 8, cost: 9600 },
  { month: 'Nov', sourceId: 's1', hires: 7, cost: 8400 },
  { month: 'Dec', sourceId: 's1', hires: 9, cost: 10800 },
  { month: 'Sep', sourceId: 's2', hires: 10, cost: 5000 },
  { month: 'Oct', sourceId: 's2', hires: 12, cost: 6000 },
  { month: 'Nov', sourceId: 's2', hires: 8, cost: 4000 },
  { month: 'Dec', sourceId: 's2', hires: 12, cost: 6000 },
];

const MOCK_SUMMARY: SourceRoiSummary = {
  totalSpend: 235500,
  totalHires: 208,
  avgCostPerHire: 1133,
  bestRoiSource: 'Careers Page',
  worstRoiSource: 'Robert Half Agency',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const SOURCE_ICONS: Record<string, typeof Globe> = {
  linkedin: Globe,
  referral: UserPlus,
  job_board: Briefcase,
  agency: Award,
  career_site: Globe,
  social: Share2,
  event: CalendarDays,
  other: Megaphone,
};

function formatCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `$${n}`;
}

type SortField = 'hireRate' | 'costPerHire' | 'candidateCount' | 'qualityScore' | 'totalCost' | 'name';

/* ================================================================== */
/*  Preset                                                             */
/* ================================================================== */
export const BreakdownBhSourceRoi = createPreset<BhSourceRoiProps>({
  name: 'BhSourceRoi.Breakdown',
  render: ({ primitives, props, tokens }: PresetContext<BhSourceRoiProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      sources: srcProp,
      trends: trendProp,
      summary: sumProp,
      selectedSource: selProp,
      onSourceSelect,
      onSortChange,
      className,
      style,
    } = props;

    const sources = srcProp?.length ? srcProp : MOCK_SOURCES;
    const trends = trendProp?.length ? trendProp : MOCK_TRENDS;
    const summary = sumProp ?? MOCK_SUMMARY;

    const [sortBy, setSortBy] = useState<SortField>('hireRate');
    const [sortAsc, setSortAsc] = useState(false);
    const [expandedSource, setExpandedSource] = useState<string | null>(selProp ?? null);


    const handleSort = useCallback((field: SortField) => {
      setSortBy(prev => {
        if (prev === field) {
          setSortAsc(a => !a);
          return prev;
        }
        setSortAsc(false);
        return field;
      });
      onSortChange?.(field);
    }, [onSortChange]);

    const handleExpand = useCallback((id: string) => {
      const next = expandedSource === id ? null : id;
      setExpandedSource(next);
      onSourceSelect?.(next);
    }, [expandedSource, onSourceSelect]);

    const sorted = useMemo(() => {
      const arr = [...sources];
      arr.sort((a, b) => {
        const va = sortBy === 'name' ? a.name : (a as any)[sortBy];
        const vb = sortBy === 'name' ? b.name : (b as any)[sortBy];
        if (typeof va === 'string') return sortAsc ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
        return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
      });
      return arr;
    }, [sources, sortBy, sortAsc]);

    const maxCandidates = useMemo(() => Math.max(...sources.map(s => s.candidateCount), 1), [sources]);

    /* ---- Styles ---- */
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const card = useMemo(() => createCardStyle(t, { padding: 28 }), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);

    const glassStyle = useMemo(() => {
      if (t.surface.useGlass && t.glass) {
        return {
          backdropFilter: t.glass.blur,
          WebkitBackdropFilter: t.glass.blur,
        };
      }
      return {};
    }, [t]);

    /* ---- Sparkline helper ---- */
    const Sparkline = ({ sourceId, width = 80, height = 28 }: { sourceId: string; width?: number; height?: number }) => {
      const data = trends.filter(tr => tr.sourceId === sourceId);
      if (data.length < 2) return null;
      const maxH = Math.max(...data.map(d => d.hires), 1);
      const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (d.hires / maxH) * (height - 4);
        return `${x},${y}`;
      }).join(' ');
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Hire trend for source`}>
          <polyline points={points} fill="none" stroke={t.colors.primaryScale[400]} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    };

    const SortHeader = ({ label, field, width }: { label: string; field: SortField; width?: number }) => (
      <Box
        onClick={() => handleSort(field)}
        role="columnheader"
        tabIndex={0}
        aria-sort={sortBy === field ? (sortAsc ? 'ascending' : 'descending') : 'none'}
        style={{
          width,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[1],
          userSelect: 'none' as const,
        }}
      >
        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: sortBy === field ? t.colors.primaryScale[600] : t.colors.neutral[500], textTransform: typo.labelTransform, letterSpacing: typo.labelLetterSpacing }}>
          {label}
        </Text>
        {sortBy === field && (
          <ArrowUpDown size={10} color={t.colors.primaryScale[600]} />
        )}
      </Box>
    );

    /* ================================================================ */
    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5], padding: t.spacing[6], backgroundColor: t.colors.neutral[50], minHeight: '100%', width: '100%', ...glassStyle, ...entrance.animate, transition: entrance.transition, ...style }} role="region" aria-label="Source ROI Breakdown">

        {/* === Summary KPIs === */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: t.spacing[4] }}>
          {[
            { label: 'Total Spend', value: formatCurrency(summary.totalSpend), icon: DollarSign, color: t.colors.errorScale[500] },
            { label: 'Total Hires', value: String(summary.totalHires), icon: Users, color: t.colors.successScale[500] },
            { label: 'Avg Cost/Hire', value: formatCurrency(summary.avgCostPerHire), icon: Target, color: t.colors.warningScale[500] },
            { label: 'Best ROI', value: summary.bestRoiSource, icon: TrendingUp, color: t.colors.successScale[600] },
            { label: 'Worst ROI', value: summary.worstRoiSource, icon: TrendingDown, color: t.colors.errorScale[600] },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <Box key={i} style={{ ...card, ...hoverStyles.base, ...createEntranceAnimation(t, { index: i }).animate, transition: createEntranceAnimation(t, { index: i }).transition }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                  <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.neutral[50] })}>
                    <Icon size={16} color={kpi.color} />
                  </Box>
                  <Text style={{ ...sectionLabel, marginBottom: 0 }}>{kpi.label}</Text>
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                  {kpi.value}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* === Source Table === */}
        <Box style={{ ...card, padding: 0, overflow: 'hidden' }} role="table" aria-label="Source breakdown table">
          {/* Table header */}
          <Box role="row" style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 80px',
            gap: t.spacing[3],
            padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
            borderBottom: `1px solid ${t.colors.neutral[200]}`,
            backgroundColor: t.colors.neutral[50],
            alignItems: 'center',
          }}>
            <SortHeader label="Source" field="name" />
            <SortHeader label="Candidates" field="candidateCount" />
            <SortHeader label="Hire Rate" field="hireRate" />
            <SortHeader label="Cost/Hire" field="costPerHire" />
            <SortHeader label="Total Cost" field="totalCost" />
            <SortHeader label="Quality" field="qualityScore" />
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], textTransform: typo.labelTransform, letterSpacing: typo.labelLetterSpacing }}>
              Trend
            </Text>
            <Box />
          </Box>

          {/* Table rows */}
          {sorted.map(src => {
            const Icon = SOURCE_ICONS[src.type] || Globe;
            const isExpanded = expandedSource === src.id;
            const qualColor = src.qualityScore >= 80 ? t.colors.successScale[600] : src.qualityScore >= 65 ? t.colors.warningScale[600] : t.colors.errorScale[600];
            const qualBg = src.qualityScore >= 80 ? t.colors.successScale[50] : src.qualityScore >= 65 ? t.colors.warningScale[50] : t.colors.errorScale[50];
            return (
              <Box key={src.id} role="rowgroup">
                <Box
                  onClick={() => handleExpand(src.id)}
                  role="row"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  aria-label={`${src.name}: ${src.hireRate.toFixed(1)}% hire rate, ${formatCurrency(src.costPerHire)} per hire`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 80px',
                    gap: t.spacing[3],
                    padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                    borderBottom: `1px solid ${t.colors.neutral[100]}`,
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? t.colors.primaryScale[50] : t.colors.common.white,
                    transition: `background-color ${t.motion.hover}`,
                    alignItems: 'center',
                  }}
                >
                  {/* Source name */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={createIconContainerStyle(t, { size: 28, color: t.colors.primaryScale[50] })}>
                      <Icon size={14} color={t.colors.primaryScale[600]} />
                    </Box>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                        {src.name}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                        {src.type.replace('_', ' ')}
                      </Text>
                    </Box>
                  </Box>

                  {/* Candidates */}
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                      {src.candidateCount.toLocaleString()}
                    </Text>
                    <Box style={{ marginTop: t.spacing[1], height: 4, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                      <Box style={{ height: '100%', width: `${(src.candidateCount / maxCandidates) * 100}%`, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[400], transition: `width ${t.motion.hover}` }} />
                    </Box>
                  </Box>

                  {/* Hire rate */}
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: src.hireRate >= 10 ? t.colors.successScale[600] : t.colors.neutral[700] }}>
                    {src.hireRate.toFixed(1)}%
                  </Text>

                  {/* Cost per hire */}
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                    {formatCurrency(src.costPerHire)}
                  </Text>

                  {/* Total cost */}
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>
                    {formatCurrency(src.totalCost)}
                  </Text>

                  {/* Quality */}
                  <Box style={{ display: 'inline-flex', padding: `2px ${t.spacing[2]}px`, borderRadius: badgeRadius, backgroundColor: qualBg }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: qualColor }}>
                      {src.qualityScore}
                    </Text>
                  </Box>

                  {/* Sparkline */}
                  <Sparkline sourceId={src.id} />

                  {/* Expand icon */}
                  <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {isExpanded ? <ChevronDown size={16} color={t.colors.neutral[400]} /> : <ChevronRight size={16} color={t.colors.neutral[400]} />}
                  </Box>
                </Box>

                {/* Expanded detail panel */}
                {isExpanded && (
                  <Box style={{ padding: `${t.spacing[4]}px ${t.spacing[6]}px`, backgroundColor: t.colors.neutral[50], borderBottom: `1px solid ${t.colors.neutral[200]}` }}>
                    <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[4] }}>
                      {[
                        { label: 'Hires', value: String(src.hireCount), sub: `of ${src.candidateCount} candidates` },
                        { label: 'Avg Time to Hire', value: `${src.avgTimeToHireDays}d`, sub: 'days average' },
                        { label: 'Cost per Candidate', value: formatCurrency(src.costPerCandidate), sub: 'per applicant' },
                        { label: '90-day Retention', value: src.retentionRate90d ? `${src.retentionRate90d}%` : 'N/A', sub: 'post-hire retention' },
                      ].map((metric, i) => (
                        <Box key={i} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], ...createCardStyle(t, { padding: 20 }) }}>
                          <Text style={{ ...sectionLabel, marginBottom: t.spacing[1] }}>{metric.label}</Text>
                          <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                            {metric.value}
                          </Text>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400]}}>
                            {metric.sub}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
