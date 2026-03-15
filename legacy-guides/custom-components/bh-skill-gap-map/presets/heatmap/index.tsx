'use client';

/**
 * BhSkillGapMap - Heatmap Preset
 * Visual dimension x candidate heatmap grid with color-coded scores,
 * priority filter pills, summary cards, and gap detail panel.
 * Slite-inspired warm design with generous whitespace.
 */

import { useState, useMemo, useCallback} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,

  createDividerStyle,
  createEmptyStateStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { BhSkillGapMapProps, GapPriority, SkillGapItem, DimensionHeatmapCell, GapSummary } from '../../core';
import { getPriorityColors, getScoreColor, getScoreBgColor } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Grid3x3, AlertTriangle, TrendingDown, BarChart3, Info, Target,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const HeatmapBhSkillGapMap = createPreset<BhSkillGapMapProps>({
  name: 'BhSkillGapMap.Heatmap',
  render: ({ primitives, props, tokens: t }: PresetContext<BhSkillGapMapProps>) => {
    const { Box, Text } = primitives;
    const br = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const pc = getPriorityColors(t);
    const isGlass = t.surface.useGlass && !!t.glass;

    const {
      analysis,
      gaps: rawGaps = [],
      heatmapData: rawHeatmapData = [],
      summary: rawSummary = {} as Partial<GapSummary>,
      dimensions: dimsProp,
      candidates: candsProp,
      selectedGapId: selectedGapProp,
      onGapSelect,
      priorityFilter: priorityFilterProp,
      onPriorityFilterChange,
      loading,
      className, style,
    } = props;

    const gaps = Array.isArray(rawGaps) ? rawGaps : [];
    const heatmapData = Array.isArray(rawHeatmapData) ? rawHeatmapData : [];
    const summary = rawSummary as Partial<GapSummary>;

    /* ── State ─────────────────────────────────────────────────── */
    const [internalSelected, setInternalSelected] = useState<string>(selectedGapProp ?? '');
    const [internalPriority, setInternalPriority] = useState<GapPriority[]>([]);

    const selectedGapId = selectedGapProp ?? internalSelected;
    const activePriority = priorityFilterProp ?? internalPriority;

    /* ── Personality + Animation ───────────────────────────────── */
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    /* ── Glass header style ────────────────────────────────────── */
    const headerGlassStyle = useMemo(() => {
      const s: React.CSSProperties = {};
      if (isGlass && t.glass) {
        s.backdropFilter = t.glass.blur;
        s.WebkitBackdropFilter = t.glass.blur;
        s.backgroundColor = t.glass.bg;
      }
      return s;
    }, [isGlass, t]);

    /* ── Callbacks ─────────────────────────────────────────────── */
    const handleGapSelect = useCallback((id: string) => { setInternalSelected(id); onGapSelect?.(id); }, [onGapSelect]);
    const togglePriority = useCallback((p: GapPriority) => {
      const next = activePriority.includes(p) ? activePriority.filter(x => x !== p) : [...activePriority, p];
      setInternalPriority(next);
      onPriorityFilterChange?.(next);
    }, [activePriority, onPriorityFilterChange]);

    /* ── Derived ───────────────────────────────────────────────── */
    const filteredGaps = useMemo(() => activePriority.length > 0 ? gaps.filter(g => g.priority && activePriority.includes(g.priority)) : gaps, [gaps, activePriority]);
    const dims = useMemo(() => dimsProp?.length ? dimsProp : [...new Set(heatmapData.map(c => c.dimension).filter(Boolean) as string[])], [dimsProp, heatmapData]);
    const cands = useMemo(() => candsProp?.length ? candsProp : [...new Set(heatmapData.map(c => c.candidate).filter(Boolean) as string[])], [candsProp, heatmapData]);
    const selectedGap = useMemo(() => gaps.find(g => g.id === selectedGapId), [gaps, selectedGapId]);

    if (loading) {
      return (
        <Box className={className} role="status" aria-label="Loading skill gap data" style={{ padding: t.spacing[8], textAlign: 'center', color: t.colors.neutral[500], ...style }}>
          <Text>Loading skill gap data...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} role="region" aria-label="Skill gap heatmap" style={{
        ...createCardStyle(t, { elevation: 'md', glass: isGlass }),
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: t.colors.common.white, overflow: 'hidden',
        ...accentLayout.outer,
        ...entrance.animate,
        transition: entrance.transition,
        width: '100%',
        ...style,
      }}>
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}

        <Box style={{ ...accentLayout.inner, display: 'flex', flexDirection: 'column' as const, flex: 1 }}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          ...headerGlassStyle,
        }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight, letterSpacing: ptypo.headingLetterSpacing, color: t.colors.neutral[900] }}>
              <Grid3x3 size={16} style={{ marginRight: t.spacing[2], verticalAlign: 'middle' }} aria-hidden="true" />
              Skill Gap Heatmap
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
              {dims.length} dimensions | {cands.length} candidates | {gaps.length} gaps identified
              {(analysis as any)?.status ? ` | Status: ${(analysis as any).status}` : ''}
              {(analysis as any)?.analysisType ? ` | Type: ${(analysis as any).analysisType}` : ''}
            </Text>
          </Box>
        </Box>

        <Box style={{ flex: 1, overflow: 'auto', padding: `${t.spacing[6]}px` }}>
          {/* Summary cards */}
          {summary && (
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[4], marginBottom: t.spacing[6] }}>
              {[
                { label: 'Total Gaps', value: summary.totalGaps ?? 0, icon: <BarChart3 size={16} />, color: t.colors.neutral[700], bg: t.colors.neutral[50] },
                { label: 'Critical', value: summary.criticalGaps ?? 0, icon: <AlertTriangle size={16} />, color: t.colors.errorScale[600], bg: t.colors.errorScale[50] },
                { label: 'Avg Gap Size', value: (summary.averageGapSize ?? 0).toFixed(1), icon: <TrendingDown size={16} />, color: t.colors.warningScale[600], bg: t.colors.warningScale[50] },
                { label: 'Top Dimension', value: summary.mostCommonDimension ?? 'N/A', icon: <Target size={16} />, color: t.colors.primaryScale[600], bg: t.colors.primaryScale[50] },
              ].map(s => (
                <Box key={s.label} style={{
                  padding: `${t.spacing[4]}px`, borderRadius: t.borderRadius.xl,
                  backgroundColor: s.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.spacing[2],
                }}>
                  <Box style={{ color: s.color }}>{s.icon}</Box>
                  <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>{s.value}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: s.color, fontWeight: t.typography.fontWeight.medium }}>{s.label}</Text>
                </Box>
              ))}
            </Box>
          )}

          {/* Priority filters */}
          <Box role="group" aria-label="Filter by priority" style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[5] }}>
            <Text style={{ ...sectionHeaderStyle, marginBottom: 0, marginRight: t.spacing[1] }}>Priority:</Text>
            {(['critical', 'high', 'medium', 'low'] as GapPriority[]).map(p => {
              const colors = pc[p];
              const active = activePriority.includes(p);
              return (
                <button key={p} onClick={() => togglePriority(p)} aria-pressed={active} aria-label={`Filter by ${p} priority`} style={{
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`, borderRadius: br,
                  border: `1px solid ${active ? colors.border : t.colors.neutral[200]}`,
                  backgroundColor: active ? colors.bgColor : t.colors.common.white,
                  color: active ? colors.color : t.colors.neutral[500],
                  fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium,
                  cursor: 'pointer', textTransform: 'capitalize' as const,
                  transition: `all ${t.motion.hover}`,
                }}>{p}</button>
              );
            })}
          </Box>

          {/* Heatmap grid */}
          {heatmapData.length > 0 && dims.length > 0 && cands.length > 0 && (
            <Box style={{ marginBottom: t.spacing[6], overflowX: 'auto' }}>
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[800], marginBottom: t.spacing[3] }}>
                Dimension Heatmap
              </Text>
              <Box role="table" aria-label="Candidate score heatmap" style={{ borderRadius: t.borderRadius.lg, border: `1px solid ${t.colors.neutral[100]}`, overflow: 'hidden' }}>
                {/* Header row */}
                <Box role="row" style={{ display: 'flex' }}>
                  <Box role="columnheader" style={{ width: 120, minWidth: 120, padding: `${t.spacing[2]}px ${t.spacing[3]}px`, backgroundColor: t.colors.neutral[50], borderBottom: `1px solid ${t.colors.neutral[100]}` }} />
                  {dims.map(dim => (
                    <Box key={dim} role="columnheader" style={{
                      width: 80, minWidth: 80, textAlign: 'center',
                      padding: `${t.spacing[2]}px ${t.spacing[1]}px`,
                      backgroundColor: t.colors.neutral[50],
                      borderBottom: `1px solid ${t.colors.neutral[100]}`,
                      borderLeft: `1px solid ${t.colors.neutral[100]}`,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[600] }}>{dim}</Text>
                    </Box>
                  ))}
                </Box>
                {/* Candidate rows */}
                {cands.map((cand, ci) => (
                  <Box key={cand} role="row" style={{ ...animStyle(ci), display: 'flex', borderBottom: ci < cands.length - 1 ? `1px solid ${t.colors.neutral[100]}` : undefined }}>
                    <Box role="rowheader" style={{
                      width: 120, minWidth: 120, padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      display: 'flex', alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700], fontWeight: t.typography.fontWeight.medium }}>{cand}</Text>
                    </Box>
                    {dims.map(dim => {
                      const cell = heatmapData.find(c => c.candidate === cand && c.dimension === dim);
                      const score = cell?.score ?? 0;
                      const maxScore = cell?.maxScore ?? 100;
                      return (
                        <Box key={`${cand}-${dim}`} role="cell" aria-label={`${cand} ${dim}: ${score}/${maxScore}`} style={{
                          width: 80, minWidth: 80, height: 36,
                          borderLeft: `1px solid ${t.colors.neutral[100]}`,
                          backgroundColor: getScoreBgColor(score, maxScore, t),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background-color 0.2s ease',
                        }}>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold,
                            color: getScoreColor(score, maxScore, t),
                          }}>{score}</Text>
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Gap list */}
          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight, color: t.colors.neutral[800], marginBottom: t.spacing[3] }}>
            Skill Gaps ({filteredGaps.length})
          </Text>
          <Box role="list" aria-label="Identified skill gaps" style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
            {filteredGaps.map((gap, gi) => {
              const gapPriority = gap.priority ?? 'low';
              const colors = pc[gapPriority];
              const isSelected = selectedGapId === gap.id;
              const currentLevel = gap.currentLevel ?? 0;
              const requiredLevel = gap.requiredLevel ?? 0;
              const pct = requiredLevel > 0 ? Math.round((currentLevel / requiredLevel) * 100) : 0;
              const barColor = pct >= 80 ? t.colors.successScale[500] : pct >= 50 ? t.colors.warningScale[500] : t.colors.errorScale[500];

              const gapEntrance = createEntranceAnimation(t, { index: gi });
              return (
                <Box key={gap.id ?? gi} role="listitem" aria-selected={isSelected} tabIndex={0}
                  onClick={() => handleGapSelect(gap.id ?? '')}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleGapSelect(gap.id ?? ''); } }}
                  aria-label={`${gap.dimension ?? 'Unknown'}: ${gapPriority} priority, gap size ${gap.gapSize ?? 0}`}
                  style={{
                  ...animStyle(gi),
                  ...cardHover.base,
                  ...gapEntrance.animate,
                  padding: `${t.spacing[3]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
                  border: `1px solid ${isSelected ? t.colors.primaryScale[300] : t.colors.neutral[100]}`,
                  backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                  cursor: 'pointer', transition: `all ${t.motion.hover}`,
                  borderLeft: `3px solid ${colors.color}`,
                }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { Object.assign(e.currentTarget.style, cardHover.hover); }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.transform = cardHover.base.transform ?? 'none'; e.currentTarget.style.boxShadow = ''; if (cardHover.hover.backgroundColor) e.currentTarget.style.backgroundColor = ''; }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{gap.dimension ?? 'Unknown'}</Text>
                      <Box style={{ padding: `0 ${t.spacing[2]}px`, borderRadius: br, backgroundColor: colors.bgColor, border: `1px solid ${colors.border}` }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: colors.color, textTransform: 'capitalize' }}>{gapPriority}</Text>
                      </Box>
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{gap.candidateCount ?? 0} candidates</Text>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${gap.dimension ?? 'Unknown'} completion`} style={{ flex: 1, height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                      <Box style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: t.borderRadius.full, transition: `width ${t.motion.hover}` }} />
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[600], minWidth: 36, textAlign: 'right' }}>
                      {currentLevel}/{requiredLevel}
                    </Text>
                  </Box>
                  {isSelected && gap.recommendation && (
                    <Box style={{
                      marginTop: t.spacing[2], padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.lg, backgroundColor: t.colors.infoScale[50],
                      border: `1px solid ${t.colors.infoScale[200]}`,
                      display: 'flex', alignItems: 'flex-start', gap: t.spacing[2],
                    }}>
                      <Info size={12} style={{ color: t.colors.infoScale[500], flexShrink: 0, marginTop: t.spacing[1] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.infoScale[700], lineHeight: 1.5 }}>{gap.recommendation}</Text>
                    </Box>
                  )}
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
