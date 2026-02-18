'use client';

/**
 * BhSourceRoi - Summary Preset
 * High-level source comparison with horizontal bar chart, ROI radar,
 * top 3 highlight cards, and aggregate cost donut.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  BarChart3,
  Award,
  Zap,
  Globe,
  UserPlus,
  Briefcase,
  Share2,
  CalendarDays,
  Megaphone,
  ArrowRight,
  Star,
  Clock,
  Trophy,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  createBadgeStyle,
  getPersonalityTypography,
  createEntranceAnimation,
  createStaggerDelay,
} from '../../../helpers';
import type {
  BhSourceRoiProps,
  SourceChannel,
  SourceTrend,
  SourceRoiSummary,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const SOURCE_ICONS: Record<string, typeof Globe> = {
  linkedin: Globe, referral: UserPlus, job_board: Briefcase,
  agency: Award, career_site: Globe, social: Share2,
  event: CalendarDays, other: Megaphone,
};

/** Token-based source colors derived from design tokens */
function getSourceColors(t: DesignTokens): string[] {
  return [
    t.colors.primaryScale[500],
    t.colors.successScale[500],
    t.colors.warningScale[500],
    t.colors.errorScale[500],
    t.colors.infoScale[500],
    t.colors.secondaryScale[500],
    t.colors.primaryScale[700],
  ];
}

/** Token-based medal colors for top ROI sources */
function getMedalColors(t: DesignTokens): string[] {
  return [
    t.colors.warningScale[400],
    t.colors.neutral[400],
    t.colors.warningScale[700],
  ];
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `$${n}`;
}

/* ================================================================== */
/*  Preset                                                             */
/* ================================================================== */
export const SummaryBhSourceRoi = createPreset<BhSourceRoiProps>({
  name: 'BhSourceRoi.Summary',
  render: ({ primitives, props, tokens }: PresetContext<BhSourceRoiProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      sources: srcProp,
      summary: sumProp,
      selectedSource: selProp,
      onSourceSelect,
      budget,
      period,
      className,
      style,
    } = props;

    const sources = srcProp?.length ? srcProp : [];
    const summary = (sumProp ?? {}) as Partial<SourceRoiSummary>;

    const [selectedId, setSelectedId] = useState<string | null>(selProp ?? null);
    const [metricView, setMetricView] = useState<'hireRate' | 'costPerHire' | 'qualityScore'>('hireRate');

    const handleSelect = useCallback((id: string) => {
      const next = selectedId === id ? null : id;
      setSelectedId(next);
      onSourceSelect?.(next);
    }, [selectedId, onSourceSelect]);

    const handleMetricChange = useCallback((value: 'hireRate' | 'costPerHire' | 'qualityScore') => {
      setMetricView(value);
    }, []);

    /* ---- Computed ---- */
    const sourceColors = useMemo(() => getSourceColors(t), [t]);
    const medalColors = useMemo(() => getMedalColors(t), [t]);

    const sortedByMetric = useMemo(() => {
      return [...sources].sort((a, b) => {
        if (metricView === 'costPerHire') return a.costPerHire - b.costPerHire;
        return (b as any)[metricView] - (a as any)[metricView];
      });
    }, [sources, metricView]);

    const maxMetric = useMemo(() => Math.max(...sources.map(s => (s as any)[metricView]), 1), [sources, metricView]);
    const totalCost = useMemo(() => sources.reduce((s, c) => s + c.totalCost, 0), [sources]);

    const top3 = useMemo(() => {
      return [...sources].sort((a, b) => {
        const roiA = (a.hireRate * a.qualityScore) / Math.max(a.costPerHire, 1);
        const roiB = (b.hireRate * b.qualityScore) / Math.max(b.costPerHire, 1);
        return roiB - roiA;
      }).slice(0, 3);
    }, [sources]);

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

    /* ================================================================ */
    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[6], padding: t.spacing[7], backgroundColor: t.colors.neutral[50], minHeight: '100%', width: '100%', ...glassStyle, ...entrance.animate, transition: entrance.transition, ...style }} role="region" aria-label="Source ROI Summary">

        {/* === Hero KPIs === */}
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
          <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: typo.headingWeight, color: t.colors.neutral[900], marginBottom: t.spacing[1], letterSpacing: typo.headingLetterSpacing }}>
            Source ROI Summary
          </Text>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[5] }}>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
              Aggregate performance across {sources.length} sourcing channels
            </Text>
            {period && (
              <Box style={{
                ...createBadgeStyle(t, 'secondary'),
                borderRadius: badgeRadius,
                display: 'inline-flex',
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{period}</Text>
              </Box>
            )}
            {budget !== undefined && (
              <Box style={{
                ...createBadgeStyle(t, 'info'),
                borderRadius: badgeRadius,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <DollarSign size={10} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>Budget: {formatCurrency(budget)}</Text>
              </Box>
            )}
          </Box>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[4] }}>
            {[
              { label: 'Total Spend', value: formatCurrency(summary.totalSpend ?? 0), icon: DollarSign, color: t.colors.errorScale[500] },
              { label: 'Total Hires', value: String(summary.totalHires ?? 0), icon: Users, color: t.colors.successScale[500] },
              { label: 'Avg Cost/Hire', value: formatCurrency(summary.avgCostPerHire ?? 0), icon: Target, color: t.colors.warningScale[500] },
              { label: 'Best ROI Source', value: summary.bestRoiSource ?? '--', icon: Star, color: t.colors.primaryScale[500] },
            ].map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <Box key={i} style={{ ...card, ...hoverStyles.base, ...createEntranceAnimation(t, { index: i }).animate, transition: createEntranceAnimation(t, { index: i }).transition }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                    <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.neutral[50] })}>
                      <Icon size={18} color={kpi.color} />
                    </Box>
                    <Text style={{ ...sectionLabel, marginBottom: 0 }}>{kpi.label}</Text>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                    {kpi.value}
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* === Two-column layout === */}
        <Box style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: t.spacing[5] }}>

          {/* --- Left: Bar chart comparison --- */}
          <Box style={{ ...card }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[5] }}>
              <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                Source Comparison
              </Text>
              <Box style={{ display: 'flex', gap: t.spacing[1] }} role="radiogroup" aria-label="Metric view">
                {([
                  { label: 'Hire Rate', value: 'hireRate' as const },
                  { label: 'Cost/Hire', value: 'costPerHire' as const },
                  { label: 'Quality', value: 'qualityScore' as const },
                ] as const).map(opt => (
                  <Box
                    key={opt.value}
                    onClick={() => handleMetricChange(opt.value)}
                    role="radio"
                    aria-checked={metricView === opt.value}
                    tabIndex={0}
                    style={{
                      padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                      borderRadius: badgeRadius,
                      cursor: 'pointer',
                      backgroundColor: metricView === opt.value ? t.colors.primaryScale[600] : t.colors.neutral[100],
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: metricView === opt.value ? t.colors.common.white : t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium }}>
                      {opt.label}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box role="list" aria-label="Source comparison bars">
              {sortedByMetric.map((src, idx) => {
                const Icon = SOURCE_ICONS[src.type] || Globe;
                const val = ((src as any)[metricView] as number) ?? 0;
                const barPct = (val / maxMetric) * 100;
                const isSelected = selectedId === src.id;
                const barColor = sourceColors[idx % sourceColors.length];
                return (
                  <Box
                    key={src.id}
                    onClick={() => handleSelect(src.id)}
                    role="listitem"
                    tabIndex={0}
                    aria-selected={isSelected}
                    aria-label={`${src.name}: ${metricView === 'costPerHire' ? formatCurrency(val) : metricView === 'hireRate' ? `${val.toFixed(1)}%` : val}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[3],
                      marginBottom: t.spacing[3],
                      cursor: 'pointer',
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: isSelected ? t.colors.primaryScale[50] : 'transparent',
                      transition: `background-color ${t.motion.hover}`,
                    }}
                  >
                    <Box style={createIconContainerStyle(t, { size: 28, color: t.colors.neutral[50] })}>
                      <Icon size={14} color={barColor} />
                    </Box>
                    <Text style={{ width: 140, fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], fontWeight: t.typography.fontWeight.medium, flexShrink: 0 }}>
                      {src.name}
                    </Text>
                    <Box style={{ flex: 1, position: 'relative' as const, height: 20 }}>
                      <Box style={{ position: 'absolute' as const, inset: 0, borderRadius: t.borderRadius.sm, backgroundColor: t.colors.neutral[100] }} />
                      <Box style={{
                        position: 'absolute' as const,
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${barPct}%`,
                        borderRadius: t.borderRadius.sm,
                        backgroundColor: barColor,
                        opacity: 0.8,
                        transition: `width ${t.motion.hover}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingRight: barPct > 25 ? t.spacing[2] : 0,
                      }}>
                        {barPct > 25 && (
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.common.white }}>
                            {metricView === 'costPerHire' ? formatCurrency(val) : metricView === 'hireRate' ? `${val.toFixed(1)}%` : val}
                          </Text>
                        )}
                      </Box>
                    </Box>
                    {barPct <= 25 && (
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600], flexShrink: 0 }}>
                        {metricView === 'costPerHire' ? formatCurrency(val) : metricView === 'hireRate' ? `${val.toFixed(1)}%` : val}
                      </Text>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* --- Right column --- */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5] }}>

            {/* Cost donut */}
            <Box style={{ ...card }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Spend Allocation</Text>
              <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: t.spacing[4] }}>
                <svg width={160} height={160} viewBox="0 0 160 160" role="img" aria-label="Spend allocation chart">
                  {(() => {
                    let cumulative = 0;
                    return sources.map((src, idx) => {
                      const pct = src.totalCost / Math.max(totalCost, 1);
                      const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
                      cumulative += pct;
                      const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
                      const largeArc = pct > 0.5 ? 1 : 0;
                      const x1 = 80 + 60 * Math.cos(startAngle);
                      const y1 = 80 + 60 * Math.sin(startAngle);
                      const x2 = 80 + 60 * Math.cos(endAngle);
                      const y2 = 80 + 60 * Math.sin(endAngle);
                      return (
                        <path
                          key={src.id}
                          d={`M 80 80 L ${x1} ${y1} A 60 60 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={sourceColors[idx % sourceColors.length]}
                          opacity={0.8}
                          stroke={t.colors.common.white}
                          strokeWidth={2}
                        />
                      );
                    });
                  })()}
                  <circle cx={80} cy={80} r={32} fill={t.colors.common.white} />
                  <text x={80} y={76} textAnchor="middle" fontSize={14} fontWeight={700} fill={t.colors.neutral[900]}>
                    {formatCurrency(totalCost)}
                  </text>
                  <text x={80} y={92} textAnchor="middle" fontSize={10} fill={t.colors.neutral[400]}>
                    total
                  </text>
                </svg>
              </Box>
              {/* Legend */}
              {sources.map((src, idx) => (
                <Box key={src.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: sourceColors[idx % sourceColors.length], flexShrink: 0 }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{src.name}</Text>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>
                    {formatCurrency(src.totalCost)}
                  </Text>
                </Box>
              ))}
            </Box>

            {/* Top 3 ROI winners */}
            <Box style={{ ...card }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Top ROI Sources</Text>
              {top3.map((src, idx) => {
                const Icon = SOURCE_ICONS[src.type] || Globe;
                const medalColor = medalColors[idx];
                const medalBg = idx === 0 ? t.colors.warningScale[50] : 'transparent';
                return (
                  <Box key={src.id} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[3], padding: t.spacing[2], borderRadius: t.borderRadius.md, backgroundColor: medalBg }}>
                    <Box style={{ width: 24, height: 24, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: medalColor }}>
                        {idx + 1}
                      </Text>
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                        {src.name}
                      </Text>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginTop: t.spacing[1] }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[600] }}>
                          {(src.hireRate ?? 0).toFixed(1)}% hire rate
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {formatCurrency(src.costPerHire)}/hire
                        </Text>
                      </Box>
                    </Box>
                    <Box style={createIconContainerStyle(t, { size: 28, color: t.colors.primaryScale[50] })}>
                      <Icon size={14} color={t.colors.primaryScale[600]} />
                    </Box>
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
